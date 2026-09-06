import asyncio
import hashlib
import time
from pymongo.errors import DuplicateKeyError

from app.core.errors import AppError
from app.core.ids import new_id
from app.core.logging import log_event
from app.schemas.common import utcnow
from .agent_service import resolve_agents
from .credit_service import reserve, refund


_creation_lock = asyncio.Lock()


def request_fingerprint(body) -> str:
    return hashlib.sha256(body.model_dump_json(by_alias=True).encode()).hexdigest()


def check_idempotency(existing: dict, body) -> None:
    if existing.get("requestHash") != request_fingerprint(body):
        raise AppError(409, "IDEMPOTENCY_CONFLICT", "This idempotency key was already used for a different request.")


async def existing_pair(store, existing: dict, body):
    check_idempotency(existing, body)
    for _ in range(100):
        run = await store.find_one("analysis_runs", {"_id":existing["runId"]})
        if run: return existing, run, False
        await asyncio.sleep(.02)
    raise AppError(409, "IDEMPOTENCY_IN_PROGRESS", "The original request is still being committed; retry shortly.")


async def emit(store, run_id: str, event_type: str, data: dict):
    run = await store.find_one_and_update("analysis_runs", {"_id":run_id}, {"$inc":{"eventSequence":1}})
    if not run:
        return None
    event_id = new_id("evt")
    event = {"_id":event_id,"id":event_id,"runId":run_id,"sequence":run["eventSequence"],"type":event_type,"createdAt":utcnow(),"data":data}
    await store.insert("run_events", event)
    return event


def snapshot(agent: dict, position: int, provider_name: str) -> dict:
    return {"originalAgentId":agent["id"],"name":agent["name"],"emoji":agent["emoji"],"color":agent["color"],"tagline":agent["tagline"],"personality":agent["personality"],"instructions":agent["instructions"],"role":agent["role"],"instructionVersion":agent.get("instructionVersion","1"),"position":position,"enabledAtExecution":True,"provider":provider_name,"model":None,"dramaScore":agent.get("dramaScore",50),"usefulnessScore":agent.get("usefulnessScore",50),"confidenceProfile":agent.get("confidenceProfile",70),"knowledgeLabel":agent.get("knowledgeLabel","User supplied"),"status":"queued","output":None,"confidence":None,"durationMs":None,"usage":None}


async def create_decision(store, settings, user_id: str, body, idempotency_key: str):
    async with _creation_lock:
        existing = await store.find_one("decisions", {"userId":user_id,"idempotencyKey":idempotency_key})
        if existing:
            return await existing_pair(store, existing, body)
        agents = await resolve_agents(store, user_id, body.agent_ids)
        now = utcnow(); decision_id = new_id("dec"); run_id = new_id("run")
        cost = len([a for a in agents if a["role"] == "analyst"])*10 + 5
        decision = {"_id":decision_id,"id":decision_id,"userId":user_id,"runId":run_id,"idempotencyKey":idempotency_key,"requestHash":request_fingerprint(body),"question":body.question,"category":body.category,"severity":body.severity,"humorLevel":body.humor_level,"providerMode":body.provider_mode,"saved":body.auto_save,"createdAt":now}
        run = {"_id":run_id,"id":run_id,"userId":user_id,"decisionId":decision_id,"status":"queued","progress":0,"createdAt":now,"startedAt":None,"completedAt":None,"eventSequence":0,"usage":{"inputTokens":0,"outputTokens":0,"totalTokens":0,"estimatedCostMinor":0,"currency":"INR","durationMs":0},"metrics":{},"finalVerdict":None,"reservedCredits":cost,"partialFailure":False,"workerClaimed":False}
        try:
            await store.insert("decisions", decision)
        except (DuplicateKeyError, ValueError):
            existing = await store.find_one("decisions", {"userId":user_id,"idempotencyKey":idempotency_key})
            return await existing_pair(store, existing, body)
        try:
            await store.insert("analysis_runs", run)
            for position, agent in enumerate(agents):
                snap = snapshot(agent, position, settings.ai_provider)
                await store.insert("run_agents", {"_id":f"{run_id}:{position}","runId":run_id,"userId":user_id,**snap})
            await reserve(store, user_id, run_id, cost)
        except Exception:
            await store.delete_many("run_agents", {"runId":run_id})
            await store.delete_one("analysis_runs", {"_id":run_id})
            await store.delete_one("decisions", {"_id":decision_id})
            raise
        return decision, run, True


async def cancel_run(store, run: dict):
    if run["status"] == "completed":
        raise AppError(409, "RUN_ALREADY_COMPLETED", "A completed run cannot be cancelled.")
    if run["status"] in {"cancelled", "failed"}:
        return await store.find_one("analysis_runs", {"_id":run["id"]})
    result = await store.update_one("analysis_runs", {"_id":run["id"],"status":{"$in":["queued","running"]}}, {"$set":{"status":"cancelled","completedAt":utcnow()}})
    current = await store.find_one("analysis_runs", {"_id":run["id"]})
    if current["status"] == "cancelled":
        await refund(store, run["userId"], run["id"], run["reservedCredits"], "cancelled_run_refund")
        await emit(store, run["id"], "run.cancelled", {})
    return current


async def execute_run(store, provider, run_id: str):
    claimed = await store.find_one_and_update("analysis_runs", {"_id":run_id,"status":"queued","workerClaimed":False}, {"$set":{"workerClaimed":True,"status":"running","startedAt":utcnow()}})
    if not claimed or claimed["status"] != "running": return
    started = time.monotonic()
    decision = await store.find_one("decisions", {"_id":claimed["decisionId"]})
    snapshots = await store.find_many("run_agents", {"runId":run_id}, sort=[("position",1)])
    analysts = [a for a in snapshots if a["role"] == "analyst"]
    judge = next(a for a in snapshots if a["role"] == "judge")
    await emit(store, run_id, "run.started", {"progress":1})

    async def one(agent):
        current = await store.find_one("analysis_runs", {"_id":run_id})
        if current["status"] == "cancelled": return None
        aid = agent["originalAgentId"]
        await store.update_one("run_agents", {"_id":agent["_id"]}, {"$set":{"status":"running"}})
        await emit(store, run_id, "agent.started", {"agentId":aid,"position":agent["position"]})
        await emit(store, run_id, "activity.created", {"message":f"{agent['name']} is examining whether this really needed a committee."})
        mark = time.monotonic()
        try:
            output, usage = await provider.analyze(decision["question"], {"id":aid, **agent}, decision["severity"], decision["humorLevel"])
            duration = round((time.monotonic()-mark)*1000)
            visible = output.model_dump(by_alias=True)
            await store.update_one("run_agents", {"_id":agent["_id"]}, {"$set":{"status":"completed","output":visible,"confidence":output.confidence,"durationMs":duration,"usage":usage}})
            data={"agentId":aid,"position":agent["position"],**visible,"durationMs":duration,"usage":usage}
            await emit(store, run_id, "agent.completed", data)
            return data
        except Exception as exc:
            log_event(
                "analysis.agent_failed",
                runId=run_id,
                agentId=aid,
                provider=type(provider).__name__,
                errorType=type(exc).__name__,
                errorCode=getattr(exc, "code", "UNEXPECTED_PROVIDER_ERROR"),
                status=getattr(exc, "status", None),
            )
            await store.update_one("run_agents", {"_id":agent["_id"]}, {"$set":{"status":"failed"}})
            await store.update_one("analysis_runs", {"_id":run_id}, {"$set":{"partialFailure":True}})
            await emit(store, run_id, "agent.failed", {"agentId":aid,"position":agent["position"],"message":"This expert dropped their notes in a metaphorical puddle."})
            return None

    results = [r for r in await asyncio.gather(*(one(a) for a in analysts)) if r]
    current = await store.find_one("analysis_runs", {"_id":run_id})
    if current["status"] == "cancelled": return
    if not results:
        await _fail(store, claimed, "All analysts failed to return a usable result.")
        return
    await store.update_one("analysis_runs", {"_id":run_id}, {"$set":{"progress":80}})
    await emit(store, run_id, "run.progress", {"progress":80,"completedAgents":len(results),"totalAgents":len(analysts)+1})
    await store.update_one("run_agents", {"_id":judge["_id"]}, {"$set":{"status":"running"}})
    await emit(store, run_id, "agent.started", {"agentId":judge["originalAgentId"],"position":judge["position"]})
    judge_mark = time.monotonic()
    try:
        verdict, judge_usage = await provider.judge(decision["question"], {"id":judge["originalAgentId"],**judge}, results, decision["severity"], decision["humorLevel"])
    except Exception as exc:
        log_event(
            "analysis.judge_failed",
            runId=run_id,
            agentId=judge["originalAgentId"],
            provider=type(provider).__name__,
            errorType=type(exc).__name__,
            errorCode=getattr(exc, "code", "UNEXPECTED_PROVIDER_ERROR"),
            status=getattr(exc, "status", None),
        )
        await store.update_one("run_agents", {"_id":judge["_id"]}, {"$set":{"status":"failed"}})
        await _fail(store, claimed, "The final judge failed to reach a verdict.")
        return
    duration = round((time.monotonic()-judge_mark)*1000)
    final = verdict.model_dump(by_alias=True)
    await store.update_one("run_agents", {"_id":judge["_id"]}, {"$set":{"status":"completed","output":final,"confidence":verdict.confidence,"durationMs":duration,"usage":judge_usage}})
    await emit(store, run_id, "agent.completed", {"agentId":judge["originalAgentId"],"position":judge["position"],**final,"durationMs":duration,"usage":judge_usage})
    all_usage=[r["usage"] for r in results]+[judge_usage]
    input_tokens=sum(u["inputTokens"] for u in all_usage); output_tokens=sum(u["outputTokens"] for u in all_usage)
    total_duration=round((time.monotonic()-started)*1000)
    usage={"inputTokens":input_tokens,"outputTokens":output_tokens,"totalTokens":input_tokens+output_tokens,"estimatedCostMinor":sum(u["estimatedCostMinor"] for u in all_usage),"currency":"INR","durationMs":total_duration}
    metrics={"actualDifficulty":{"NORMAL":2,"SEVERE":5,"EXISTENTIAL":9}[decision["severity"]],"necessityScore":round(min(1, len(decision["question"])/500),2),"mentalGymnasticsScore":min(100,40+len(analysts)*9),"argumentCount":len(results)}
    updated = await store.update_one("analysis_runs", {"_id":run_id,"status":"running"}, {"$set":{"status":"completed","progress":100,"completedAt":utcnow(),"finalVerdict":final,"usage":usage,"metrics":metrics}})
    if updated.matched_count:
        await emit(store, run_id, "usage.updated", usage)
        await emit(store, run_id, "run.completed", {"progress":100,"finalVerdict":final,"usage":usage,"metrics":metrics})


async def _fail(store, run: dict, message: str):
    result = await store.update_one("analysis_runs", {"_id":run["id"],"status":"running"}, {"$set":{"status":"failed","completedAt":utcnow(),"error":{"code":"AI_RUN_FAILED","message":message}}})
    if result.matched_count:
        await refund(store, run["userId"], run["id"], run["reservedCredits"], "failed_run_refund")
        await emit(store, run["id"], "run.failed", {"code":"AI_RUN_FAILED","message":message})


async def full_decision(store, decision: dict):
    run = await store.find_one("analysis_runs", {"_id":decision["runId"]})
    agents = await store.find_many("run_agents", {"runId":run["id"]}, sort=[("position",1)])
    public_agents=[]
    for a in agents:
        public_agents.append({k:v for k,v in a.items() if k not in {"_id","userId","instructions"}})
    return {"id":decision["id"],"run":{k:v for k,v in run.items() if k in {"id","status","progress","createdAt","startedAt","completedAt","partialFailure"}},"question":decision["question"],"category":decision["category"],"severity":decision["severity"],"saved":decision["saved"],"agents":public_agents,"finalVerdict":run.get("finalVerdict"),"usage":run.get("usage"),"metrics":run.get("metrics")}


async def delete_decision_data(store, decision: dict):
    run_id=decision["runId"]
    await store.delete_many("run_events", {"runId":run_id})
    await store.delete_many("run_agents", {"runId":run_id})
    await store.delete_one("analysis_runs", {"_id":run_id})
    await store.delete_one("decisions", {"_id":decision["id"]})
