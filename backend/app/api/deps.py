from fastapi import Cookie, Request
from app.core.errors import AppError
from app.services.auth_service import resolve_session


async def current_user(request: Request, ot_session: str | None = Cookie(default=None)):
    user = await resolve_session(request.app.state.store, ot_session, request.app.state.settings)
    if not user:
        raise AppError(401, "AUTH_REQUIRED", "Authentication is required or the session has expired.")
    return user


async def owned_run(request: Request, run_id: str, user: dict):
    run = await request.app.state.store.find_one("analysis_runs", {"_id":run_id,"userId":user["id"]})
    if not run:
        raise AppError(404, "RUN_NOT_FOUND", "Run not found.")
    return run

