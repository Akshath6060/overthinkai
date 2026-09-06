from fastapi import APIRouter, Depends, Request, Response
from app.api.deps import current_user
from app.core.errors import AppError
from app.core.ids import new_id
from app.schemas.agent import AgentCreate, AgentPatch, AgentOrder
from app.schemas.common import utcnow
from app.services.agent_service import PRESETS, effective_agents

router = APIRouter(tags=["agents"])


@router.get("/agents")
async def list_agents(request: Request, user=Depends(current_user)):
    return {"agents":await effective_agents(request.app.state.store, user["id"])}


@router.get("/agent-presets")
async def presets(user=Depends(current_user)):
    return {"presets":PRESETS}


@router.post("/agents", status_code=201)
async def create_agent(body: AgentCreate, request: Request, user=Depends(current_user)):
    await request.app.state.limiter.check(f"agent-create:{user['id']}", 10, 60)
    all_agents=await effective_agents(request.app.state.store,user["id"])
    aid=new_id("agt"); now=utcnow()
    doc={"_id":aid,"id":aid,"ownerUserId":user["id"],**body.model_dump(by_alias=True),"position":len(all_agents),"dramaScore":50,"usefulnessScore":50,"confidenceProfile":70,"knowledgeLabel":"User supplied","instructionVersion":"1","createdAt":now,"updatedAt":now}
    await request.app.state.store.insert("agents",doc)
    return (await effective_agents(request.app.state.store,user["id"]))[-1]


@router.patch("/agents/{agent_id}")
async def patch_agent(agent_id: str, body: AgentPatch, request: Request, user=Depends(current_user)):
    await request.app.state.limiter.check(f"agent-edit:{user['id']}", 30, 60)
    store=request.app.state.store
    agent=await store.find_one("agents",{"_id":agent_id})
    if not agent or agent.get("ownerUserId") not in (None,user["id"]): raise AppError(404,"AGENT_NOT_FOUND","Agent not found.")
    values=body.model_dump(by_alias=True,exclude_none=True)
    if agent.get("ownerUserId") is None:
        forbidden=set(values)-{"enabled"}
        if forbidden: raise AppError(403,"SYSTEM_AGENT_IMMUTABLE","System agents can only be enabled or disabled.")
        if "enabled" in values:
            pref=await store.find_one("user_agent_preferences",{"userId":user["id"],"agentId":agent_id})
            if pref: await store.update_one("user_agent_preferences",{"_id":pref["_id"]},{"$set":{"enabled":values["enabled"]}})
            else: await store.insert("user_agent_preferences",{"_id":f"{user['id']}:{agent_id}","userId":user["id"],"agentId":agent_id,"enabled":values["enabled"]})
    else:
        await store.update_one("agents",{"_id":agent_id},{"$set":{**values,"updatedAt":utcnow()}})
    return next(a for a in await effective_agents(store,user["id"]) if a["id"]==agent_id)


@router.delete("/agents/{agent_id}", status_code=204)
async def delete_agent(agent_id: str, request: Request, user=Depends(current_user)):
    await request.app.state.limiter.check(f"agent-delete:{user['id']}", 10, 60)
    agent=await request.app.state.store.find_one("agents",{"_id":agent_id})
    if not agent or (agent.get("ownerUserId") not in (None,user["id"])): raise AppError(404,"AGENT_NOT_FOUND","Agent not found.")
    if agent.get("ownerUserId") is None: raise AppError(403,"SYSTEM_AGENT_DELETE_FORBIDDEN","System agents cannot be deleted.")
    await request.app.state.store.delete_one("agents",{"_id":agent_id,"ownerUserId":user["id"]})


@router.put("/agents/order")
async def reorder(body: AgentOrder, request: Request, user=Depends(current_user)):
    if len(body.agent_ids)!=len(set(body.agent_ids)): raise AppError(422,"DUPLICATE_AGENT_ORDER","Agent order contains duplicates.")
    current=await effective_agents(request.app.state.store,user["id"])
    known={a["id"] for a in current}
    if set(body.agent_ids)!=known: raise AppError(422,"INCOMPLETE_AGENT_ORDER","agentIds must contain every available agent exactly once.")
    # A single-document replacement makes the ordering atomic even without Mongo transactions.
    doc={"userId":user["id"],"agentIds":body.agent_ids,"updatedAt":utcnow()}
    await request.app.state.store.update_one("user_agent_order",{"_id":user["id"]},{"$set":doc},upsert=True)
    return {"agentIds":body.agent_ids}
