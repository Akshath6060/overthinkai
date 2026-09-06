import asyncio
import re
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.ai.mock_provider import MockProvider
from app.ai.openai_provider import OpenAIProvider
from app.ai.gemini_provider import GeminiProvider
from app.core.config import Settings, get_settings
from app.core.errors import AppError
from app.core.ids import new_id
from app.core.logging import configure_logging, log_event
from app.core.rate_limit import ProcessRateLimiter
from app.db.indexes import ensure_indexes
from app.db.store import MemoryStore, MongoStore
from app.services.agent_service import seed_system_agents
from app.workers.analysis_worker import AnalysisWorker
from app.api.v1 import agents, analytics, auth, decisions, me, runs, settings as settings_api


def error_response(request: Request, status: int, code: str, message: str, details=None, headers=None):
    return JSONResponse(status_code=status,headers=headers,content={"error":{"code":code,"message":message,"requestId":getattr(request.state,"request_id",new_id("req")),"details":details or {}}})


def _required_key(value: str, provider: str, env_var: str) -> str:
    if not value.strip():
        raise RuntimeError(f"AI_PROVIDER={provider} requires {env_var}. Set {env_var} in backend/.env, or use AI_PROVIDER=mock for offline development.")
    return value


def create_app(settings_override: Settings | None = None, store_override=None, provider_override=None) -> FastAPI:
    cfg=settings_override or get_settings()
    configure_logging(cfg.log_level)

    @asynccontextmanager
    async def lifespan(app: FastAPI):
        if store_override is not None: store=store_override
        elif cfg.mongodb_uri.startswith("memory://"): store=MemoryStore()
        elif cfg.mongodb_uri: store=MongoStore(cfg.mongodb_uri,cfg.mongodb_database)
        else: raise RuntimeError("MONGODB_URI is required; use memory:// only for explicit local/test mode")
        await store.ping(); await ensure_indexes(store); await seed_system_agents(store)
        if provider_override is not None: provider=provider_override
        elif cfg.ai_provider=="mock": provider=MockProvider()
        elif cfg.ai_provider=="gemini": provider=GeminiProvider(_required_key(cfg.gemini_api_key,"gemini","GEMINI_API_KEY"),cfg.gemini_model,cfg.gemini_judge_model)
        else: provider=OpenAIProvider(_required_key(cfg.openai_api_key,"openai","OPENAI_API_KEY"),cfg.openai_model,cfg.openai_judge_model)
        app.state.store=store; app.state.settings=cfg; app.state.provider=provider
        app.state.limiter=ProcessRateLimiter(); app.state.tasks=set()
        worker=AnalysisWorker(store,provider)
        app.state.spawn_run=lambda run_id: asyncio.create_task(worker.execute(run_id))
        log_event("application.started",environment=cfg.app_env,provider=cfg.ai_provider,storage="memory" if isinstance(store,MemoryStore) else "mongodb")
        yield
        if app.state.tasks:
            await asyncio.gather(*app.state.tasks,return_exceptions=True)
        await store.close()

    docs_url="/docs" if cfg.docs_enabled else None
    app=FastAPI(title=cfg.app_name,version="1.0.0",docs_url=docs_url,redoc_url="/redoc" if cfg.docs_enabled else None,openapi_url="/openapi.json" if cfg.docs_enabled else None,lifespan=lifespan)
    app.add_middleware(CORSMiddleware,allow_origins=cfg.cors_origins,allow_credentials=True,allow_methods=["GET","POST","PUT","PATCH","DELETE","OPTIONS"],allow_headers=["Content-Type","Idempotency-Key","Last-Event-ID","X-Request-ID"],expose_headers=["X-Request-ID","Content-Disposition"])
    app.add_middleware(GZipMiddleware, minimum_size=1000)

    @app.middleware("http")
    async def request_context(request:Request,call_next):
        supplied=request.headers.get("x-request-id","")
        request.state.request_id=supplied if re.fullmatch(r"[A-Za-z0-9_.:-]{1,100}",supplied) else new_id("req")
        started=time.monotonic()
        if cfg.app_env=="production" and request.method in {"POST","PUT","PATCH","DELETE"}:
            origin=request.headers.get("origin")
            if origin not in cfg.cors_origins: return error_response(request,403,"ORIGIN_FORBIDDEN","The request origin is not allowed.")
        response=await call_next(request)
        response.headers["X-Request-ID"]=request.state.request_id
        response.headers["X-Content-Type-Options"]="nosniff"
        response.headers["Referrer-Policy"]="no-referrer"
        response.headers["Permissions-Policy"]="camera=(), microphone=(), geolocation=()"
        if cfg.app_env == "production": response.headers["Strict-Transport-Security"]="max-age=31536000; includeSubDomains"
        log_event("http.request",requestId=request.state.request_id,method=request.method,route=request.url.path,status=response.status_code,durationMs=round((time.monotonic()-started)*1000))
        return response

    @app.exception_handler(AppError)
    async def app_error(request,exc): return error_response(request,exc.status,exc.code,exc.message,exc.details,exc.headers)

    @app.exception_handler(StarletteHTTPException)
    async def http_error(request,exc):
        messages={403:"Permission denied.",404:"Resource not found.",405:"Method not allowed."}
        return error_response(request,exc.status_code,f"HTTP_{exc.status_code}",messages.get(exc.status_code,"Request could not be completed."))

    @app.exception_handler(RequestValidationError)
    async def validation_error(request,exc):
        details=[]
        for item in exc.errors(): details.append({"field":".".join(str(x) for x in item["loc"] if x not in {"body","query","header"}),"message":item["msg"],"type":item["type"]})
        return error_response(request,422,"VALIDATION_ERROR","The request did not pass validation.",{"issues":details})

    @app.exception_handler(Exception)
    async def unknown_error(request,exc):
        log_event("http.error",requestId=getattr(request.state,"request_id",None),code="INTERNAL_ERROR",exceptionType=type(exc).__name__)
        return error_response(request,500,"INTERNAL_ERROR","The council experienced an internal crisis.")

    @app.get("/health",tags=["health"])
    async def health(): return {"status":"ok"}
    @app.get("/api/v1/health",tags=["health"])
    async def api_health(): return {"status":"ok"}
    @app.get("/health/ready",tags=["health"])
    async def readiness(request: Request):
        try: await request.app.state.store.ping()
        except Exception: return JSONResponse(status_code=503,content={"status":"unavailable"})
        return {"status":"ready"}

    for router in [auth.router,me.router,settings_api.router,agents.router,decisions.router,runs.router,analytics.router]: app.include_router(router,prefix="/api/v1")
    return app


app=create_app()
