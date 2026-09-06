import base64
import json
import re
from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Query, Request, Response
from app.api.deps import current_user
from app.core.errors import AppError
from app.schemas.decision import DecisionCreate, Severity
from app.services.run_service import create_decision, delete_decision_data, full_decision

router = APIRouter(prefix="/decisions", tags=["decisions"])


def encode_cursor(doc):
    raw=f"{doc['createdAt'].isoformat()}|{doc['id']}"
    return base64.urlsafe_b64encode(raw.encode()).decode().rstrip("=")


def decode_cursor(value):
    try:
        raw=base64.urlsafe_b64decode(value+"="*(-len(value)%4)).decode()
        timestamp, ident=raw.rsplit("|",1)
        return datetime.fromisoformat(timestamp), ident
    except Exception as exc: raise AppError(400,"INVALID_CURSOR","The pagination cursor is invalid.") from exc


@router.post("", status_code=202)
async def create(body: DecisionCreate, request: Request, response: Response, idempotency_key: str = Header(alias="Idempotency-Key"), user=Depends(current_user)):
    try: UUID(idempotency_key)
    except (ValueError, AttributeError): raise AppError(400,"INVALID_IDEMPOTENCY_KEY","Idempotency-Key must be a UUID.")
    await request.app.state.limiter.check(f"decision:{user['id']}", 10, 60)
    decision,run,is_new=await create_decision(request.app.state.store,request.app.state.settings,user["id"],body,idempotency_key)
    if is_new:
        task=request.app.state.spawn_run(run["id"])
        request.app.state.tasks.add(task); task.add_done_callback(request.app.state.tasks.discard)
    return {"decisionId":decision["id"],"runId":run["id"],"status":run["status"],"eventsUrl":f"/api/v1/runs/{run['id']}/events","createdAt":decision["createdAt"]}


@router.get("")
async def history(request: Request, q: str | None=None, severity: Severity | None=None, cursor: str|None=None, limit: int=Query(20,ge=1,le=100), user=Depends(current_user)):
    query={"userId":user["id"],"saved":True}
    if severity: query["severity"]=severity
    docs=await request.app.state.store.find_many("decisions",query,sort=[("createdAt",-1),("id",-1)])
    if q: docs=[d for d in docs if q.casefold() in d["question"].casefold()]
    if cursor:
        ts,ident=decode_cursor(cursor); docs=[d for d in docs if (d["createdAt"],d["id"]) < (ts,ident)]
    page=docs[:limit+1]; has_more=len(page)>limit; page=page[:limit]
    items=[]
    for d in page:
        run=await request.app.state.store.find_one("analysis_runs",{"_id":d["runId"]})
        agents=await request.app.state.store.count("run_agents",{"runId":d["runId"],"role":"analyst"})
        final=run.get("finalVerdict") or {}
        items.append({"decisionId":d["id"],"runId":d["runId"],"question":d["question"],"finalVerdictHeadline":final.get("headline"),"severity":d["severity"],"category":d["category"],"agentCount":agents,"confidence":final.get("confidence"),"createdAt":d["createdAt"],"runStatus":run["status"]})
    return {"items":items,"nextCursor":encode_cursor(page[-1]) if has_more and page else None}


@router.get("/{decision_id}")
async def get_decision(decision_id: str, request: Request, user=Depends(current_user)):
    decision=await request.app.state.store.find_one("decisions",{"_id":decision_id,"userId":user["id"]})
    if not decision: raise AppError(404,"DECISION_NOT_FOUND","Decision not found.")
    return await full_decision(request.app.state.store,decision)


@router.delete("/{decision_id}", status_code=204)
async def delete_decision(decision_id: str, request: Request, user=Depends(current_user)):
    await request.app.state.limiter.check(f"decision-delete:{user['id']}", 20, 60)
    decision=await request.app.state.store.find_one("decisions",{"_id":decision_id,"userId":user["id"]})
    if not decision: raise AppError(404,"DECISION_NOT_FOUND","Decision not found.")
    run=await request.app.state.store.find_one("analysis_runs",{"_id":decision["runId"]})
    if run["status"] in {"queued","running"}: raise AppError(409,"RUN_ACTIVE","Cancel the active run before deleting it.")
    await delete_decision_data(request.app.state.store,decision)

