import asyncio
from uuid import uuid4
from fastapi.testclient import TestClient

from app.ai.provider import AIProvider
from app.core.config import Settings
from app.db.store import MemoryStore
from app.main import create_app
from app.services.agent_service import seed_system_agents
from app.services.auth_service import create_guest
from app.services.run_service import create_decision as service_create
from app.schemas.decision import DecisionCreate
from conftest import create_decision, wait_complete


class FailingProvider(AIProvider):
    async def analyze(self,*args,**kwargs): raise RuntimeError("provider exploded with SECRET_VALUE")
    async def judge(self,*args,**kwargs): raise RuntimeError("should not run")


class SlowProvider(AIProvider):
    async def analyze(self,*args,**kwargs):
        await asyncio.sleep(.2)
        from app.schemas.ai import AnalystOutput
        return AnalystOutput(analysis="Visible summary",verdict="FINE",confidence=70),{"inputTokens":1,"outputTokens":1,"estimatedCostMinor":0,"currency":"INR"}
    async def judge(self,*args,**kwargs):
        await asyncio.sleep(.2)
        from app.schemas.ai import JudgeOutput
        return JudgeOutput(headline="DONE",explanation="Visible",confidence=70,approveCount=1,disapproveCount=0,dissentingAgentIds=[]),{"inputTokens":1,"outputTokens":1,"estimatedCostMinor":0,"currency":"INR"}


def configured(provider):
    settings=Settings(app_env="test",mongodb_uri="memory://",ai_provider="mock",session_secret="test-session-secret-that-is-long-enough")
    return create_app(settings,MemoryStore(),provider)


def minimal(question="Should I proceed?"):
    return {"question":question,"category":"Life","severity":"NORMAL","humorLevel":"Dry","providerMode":"council","agentIds":["agent_practical","agent_judge"],"autoSave":True}


def test_provider_failure_refunds_and_redacts():
    with TestClient(configured(FailingProvider())) as client:
        client.post("/api/v1/auth/guest")
        made=create_decision(client,minimal()).json()
        run=wait_complete(client,made["runId"])
        assert run.json()["status"]=="failed"
        assert client.get("/api/v1/me").json()["plan"]["creditsUsed"]==0
        assert "SECRET_VALUE" not in run.text


def test_cancelled_run_cannot_complete():
    with TestClient(configured(SlowProvider())) as client:
        client.post("/api/v1/auth/guest")
        made=create_decision(client,minimal()).json()
        cancelled=client.post(f"/api/v1/runs/{made['runId']}/cancel")
        assert cancelled.status_code==200 and cancelled.json()["status"]=="cancelled"
        import time; time.sleep(.45)
        assert client.get(f"/api/v1/runs/{made['runId']}").json()["status"]=="cancelled"
        assert client.get("/api/v1/me").json()["plan"]["creditsUsed"]==0


def test_rate_limit_returns_retry_after():
    with TestClient(configured(SlowProvider())) as client:
        for _ in range(10):
            assert client.post("/api/v1/auth/guest").status_code == 200
        limited = client.post("/api/v1/auth/guest")
        assert limited.status_code == 429
        assert int(limited.headers["retry-after"]) >= 1
        assert limited.json()["error"]["code"] == "RATE_LIMITED"


def test_user_isolation(authed,decision_body):
    custom=authed.post("/api/v1/agents",json={"name":"Private","instructions":"My private instruction"}).json()
    made=create_decision(authed,decision_body).json(); wait_complete(authed,made["runId"])
    authed.cookies.clear()
    second=authed.post("/api/v1/auth/guest").json()
    assert authed.get(f"/api/v1/decisions/{made['decisionId']}").status_code==404
    assert authed.delete(f"/api/v1/decisions/{made['decisionId']}").status_code==404
    assert authed.get(f"/api/v1/runs/{made['runId']}/events").status_code==404
    assert authed.patch(f"/api/v1/agents/{custom['id']}",json={"name":"Stolen"}).status_code==404
    exported=authed.get("/api/v1/me/export").text
    assert made["decisionId"] not in exported and custom["id"] not in exported


def test_snapshot_survives_custom_agent_edit(authed):
    custom=authed.post("/api/v1/agents",json={"name":"Original Name","instructions":"Be concise."}).json()
    body={**minimal(),"agentIds":[custom["id"],"agent_judge"]}
    made=create_decision(authed,body).json(); wait_complete(authed,made["runId"])
    authed.patch(f"/api/v1/agents/{custom['id']}",json={"name":"Changed Name"})
    agents=authed.get(f"/api/v1/decisions/{made['decisionId']}").json()["agents"]
    assert agents[0]["name"]=="Original Name"


async def test_concurrent_idempotency_creates_one_run_and_charge():
    store=MemoryStore(); settings=Settings(app_env="test",mongodb_uri="memory://",ai_provider="mock",session_secret="test-session-secret-that-is-long-enough")
    await seed_system_agents(store); user=await create_guest(store,settings)
    body=DecisionCreate(**minimal()); key=str(uuid4())
    results=await asyncio.gather(service_create(store,settings,user["id"],body,key),service_create(store,settings,user["id"],body,key))
    assert results[0][0]["id"]==results[1][0]["id"]
    assert await store.count("decisions",{"userId":user["id"]})==1
    assert await store.count("analysis_runs",{"userId":user["id"]})==1
    reservations=await store.find_many("credit_ledger",{"userId":user["id"],"reason":"run_reservation"})
    assert len(reservations)==1
