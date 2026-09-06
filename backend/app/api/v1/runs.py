import asyncio
import json
import time
from fastapi import APIRouter, Depends, Header, Request
from fastapi.responses import StreamingResponse
from app.api.deps import current_user
from app.core.errors import AppError
from app.services.run_service import cancel_run
from app.schemas.common import iso

router=APIRouter(prefix="/runs",tags=["runs"])


async def get_owned(store,run_id,user_id):
    run=await store.find_one("analysis_runs",{"_id":run_id,"userId":user_id})
    if not run: raise AppError(404,"RUN_NOT_FOUND","Run not found.")
    return run


def safe_run(run): return {k:v for k,v in run.items() if k not in {"_id","userId","workerClaimed","reservedCredits","eventSequence"}}


@router.get("/{run_id}")
async def get_run(run_id:str,request:Request,user=Depends(current_user)):
    run=await get_owned(request.app.state.store,run_id,user["id"])
    agents=await request.app.state.store.find_many("run_agents",{"runId":run_id},sort=[("position",1)])
    return {**safe_run(run),"agents":[{k:v for k,v in a.items() if k not in {"_id","userId","instructions"}} for a in agents]}


@router.post("/{run_id}/cancel")
async def cancel(run_id:str,request:Request,user=Depends(current_user)):
    await request.app.state.limiter.check(f"run-cancel:{user['id']}",20,60)
    return safe_run(await cancel_run(request.app.state.store,await get_owned(request.app.state.store,run_id,user["id"])))


@router.get("/{run_id}/events")
async def events(run_id:str,request:Request,last_event_id:str|None=Header(default=None,alias="Last-Event-ID"),user=Depends(current_user)):
    store=request.app.state.store
    await get_owned(store,run_id,user["id"])
    after=0
    if last_event_id:
        if last_event_id.isdigit(): after=int(last_event_id)
        else:
            event=await store.find_one("run_events",{"_id":last_event_id,"runId":run_id})
            if not event: raise AppError(400,"INVALID_EVENT_ID","Last-Event-ID is not valid for this run.")
            after=event["sequence"]

    async def stream():
        sequence=after; heartbeat=time.monotonic()
        while True:
            found=await store.find_many("run_events",{"runId":run_id,"sequence":{"$gt":sequence}},sort=[("sequence",1)])
            for event in found:
                sequence=event["sequence"]
                payload={k:v for k,v in event.items() if k!="_id"}
                payload["createdAt"]=iso(event["createdAt"])
                yield f"id: {event['id']}\nevent: {event['type']}\ndata: {json.dumps(payload,default=str,separators=(',',':'))}\n\n"
                heartbeat=time.monotonic()
            run=await store.find_one("analysis_runs",{"_id":run_id})
            if run["status"] in {"completed","failed","cancelled"} and sequence>=run["eventSequence"]: break
            if await request.is_disconnected(): break
            if time.monotonic()-heartbeat>=10:
                yield ": heartbeat\n\n"; heartbeat=time.monotonic()
            await asyncio.sleep(.15)
    return StreamingResponse(stream(),media_type="text/event-stream",headers={"Cache-Control":"no-cache, no-transform","X-Accel-Buffering":"no","Connection":"keep-alive"})
