import json
from fastapi import APIRouter, Depends, Request, Response
from app.api.deps import current_user
from app.services.agent_service import effective_agents
from app.services.auth_service import me_payload
from app.services.run_service import cancel_run, delete_decision_data, full_decision

router=APIRouter(prefix="/me",tags=["account"])


@router.get("")
async def me(request:Request,user=Depends(current_user)):
    return await me_payload(request.app.state.store,user,request.app.state.settings)


@router.get("/export")
async def export(request:Request,user=Depends(current_user)):
    store=request.app.state.store
    profile={k:v for k,v in user.items() if k!="_id"}
    settings=await store.find_one("user_settings",{"userId":user["id"]}) or {}
    settings={k:v for k,v in settings.items() if k not in {"_id","userId","updatedAt"}}
    agents=await effective_agents(store,user["id"])
    decisions=await store.find_many("decisions",{"userId":user["id"]},sort=[("createdAt",-1)])
    results=[await full_decision(store,d) for d in decisions]
    credits=[{k:v for k,v in e.items() if k not in {"_id","userId","idempotencyRef"}} for e in await store.find_many("credit_ledger",{"userId":user["id"]},sort=[("createdAt",1)])]
    body=json.dumps({"profile":profile,"settings":settings,"agents":agents,"decisions":results,"account":{"creditLedger":credits}},default=str,separators=(",",":"))
    return Response(body,media_type="application/json",headers={"Content-Disposition":f'attachment; filename="overthinker-export-{user["id"]}.json"'})


@router.delete("/decisions",status_code=204)
async def delete_all(request:Request,user=Depends(current_user)):
    await request.app.state.limiter.check(f"delete-all:{user['id']}",3,300)
    store=request.app.state.store
    decisions=await store.find_many("decisions",{"userId":user["id"]})
    for decision in decisions:
        run=await store.find_one("analysis_runs",{"_id":decision["runId"]})
        if run and run["status"] in {"queued","running"}: await cancel_run(store,run)
        await delete_decision_data(store,decision)

