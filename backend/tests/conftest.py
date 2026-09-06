import time
from uuid import uuid4
import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.db.store import MemoryStore
from app.ai.mock_provider import MockProvider
from app.main import create_app


@pytest.fixture
def client():
    settings=Settings(app_env="test",mongodb_uri="memory://",ai_provider="mock",session_secret="test-session-secret-that-is-long-enough",rate_limit_enabled=False)
    with TestClient(create_app(settings,MemoryStore(),MockProvider())) as c: yield c


@pytest.fixture
def authed(client):
    assert client.post("/api/v1/auth/guest").status_code==200
    return client


@pytest.fixture
def decision_body():
    return {"question":"Should I order biryani?","category":"Food","severity":"SEVERE","humorLevel":"Dry","providerMode":"council","agentIds":["agent_finance","agent_risk","agent_emotion","agent_practical","agent_devil","agent_judge"],"autoSave":True}


def create_decision(client,body,key=None):
    return client.post("/api/v1/decisions",json=body,headers={"Idempotency-Key":key or str(uuid4())})


def wait_complete(client,run_id):
    for _ in range(100):
        result=client.get(f"/api/v1/runs/{run_id}")
        if result.json().get("status") in {"completed","failed","cancelled"}: return result
        time.sleep(.01)
    raise AssertionError("run did not finish")
