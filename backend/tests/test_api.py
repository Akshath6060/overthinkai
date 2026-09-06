import json
from uuid import uuid4
from conftest import create_decision, wait_complete


def test_health_and_auth(client):
    assert client.get("/health").json()=={"status":"ok"}
    assert client.get("/api/v1/me").status_code==401
    login=client.post("/api/v1/auth/guest")
    assert login.status_code==200 and login.json()["user"]["guest"] is True
    assert client.get("/api/v1/me").status_code==200
    assert client.post("/api/v1/auth/guest").json()["user"]["id"]==login.json()["user"]["id"]
    assert client.post("/api/v1/auth/logout").status_code==204
    assert client.get("/api/v1/me").status_code==401


def test_settings_persist_and_validate(authed):
    assert authed.patch("/api/v1/settings",json={"humorLevel":"Unhinged","autoSave":False}).status_code==200
    assert authed.get("/api/v1/settings").json()["humorLevel"]=="Unhinged"
    bad=authed.patch("/api/v1/settings",json={"theme":"ultraviolet"})
    assert bad.status_code==422 and bad.json()["error"]["code"]=="VALIDATION_ERROR"


def test_decision_validation(authed,decision_body):
    for question in ["", "ab", "x"*2001]:
        body={**decision_body,"question":question}
        assert create_decision(authed,body).status_code==422
    for key,value in [("severity","PANIC"),("category","Taxes")]:
        assert create_decision(authed,{**decision_body,key:value}).status_code==422
    assert create_decision(authed,{**decision_body,"agentIds":["agent_finance","nope","agent_judge"]}).status_code==422
    assert create_decision(authed,{**decision_body,"agentIds":["agent_finance","agent_finance","agent_judge"]}).status_code==422


def test_full_run_idempotency_history_analytics_and_sse(authed,decision_body):
    key=str(uuid4())
    first=create_decision(authed,decision_body,key); second=create_decision(authed,decision_body,key)
    assert first.status_code==202 and first.json()["runId"]==second.json()["runId"]
    conflict=create_decision(authed,{**decision_body,"question":"A different question?"},key)
    assert conflict.status_code==409 and conflict.json()["error"]["code"]=="IDEMPOTENCY_CONFLICT"
    run_id=first.json()["runId"]; decision_id=first.json()["decisionId"]
    run=wait_complete(authed,run_id).json()
    assert run["status"]=="completed" and run["progress"]==100
    assert authed.post(f"/api/v1/runs/{run_id}/cancel").status_code==409
    assert "BIRYANI" in run["finalVerdict"]["headline"]
    full=authed.get(f"/api/v1/decisions/{decision_id}").json()
    assert len(full["agents"])==6 and full["usage"]["totalTokens"]>0
    history=authed.get("/api/v1/decisions?q=biryani&severity=SEVERE").json()
    assert len(history["items"])==1
    analytics=authed.get("/api/v1/analytics").json()
    assert analytics["summary"]["decisionCount"]==1
    stream=authed.get(f"/api/v1/runs/{run_id}/events")
    assert stream.status_code==200 and "run.completed" in stream.text
    ids=[line[4:] for line in stream.text.splitlines() if line.startswith("id: ")]
    replay=authed.get(f"/api/v1/runs/{run_id}/events",headers={"Last-Event-ID":ids[-2]})
    assert "run.completed" in replay.text
    me=authed.get("/api/v1/me").json()
    assert me["plan"]["creditsUsed"]==55


def test_agents_crud_order_snapshot(authed,decision_body):
    agents=authed.get("/api/v1/agents").json()["agents"]
    assert len(agents)==6 and "instructions" not in agents[0]
    made=authed.post("/api/v1/agents",json={"name":"Mom","instructions":"Ask whether there is food at home."}).json()
    assert made["ownership"]=="user"
    assert authed.patch(f"/api/v1/agents/{made['id']}",json={"name":"Mother Board"}).status_code==200
    all_ids=[a["id"] for a in authed.get("/api/v1/agents").json()["agents"]]
    assert authed.put("/api/v1/agents/order",json={"agentIds":list(reversed(all_ids))}).status_code==200
    assert authed.put("/api/v1/agents/order",json={"agentIds":[all_ids[0],all_ids[0]]}).status_code==422
    assert authed.delete("/api/v1/agents/agent_finance").status_code==403
    assert authed.delete(f"/api/v1/agents/{made['id']}").status_code==204


def test_export_and_deletion(authed,decision_body):
    made=create_decision(authed,decision_body).json(); wait_complete(authed,made["runId"])
    exported=authed.get("/api/v1/me/export")
    assert "attachment" in exported.headers["content-disposition"]
    text=exported.text
    assert "ot_session" not in text and "tokenHash" not in text and "instructions\"" not in text
    assert authed.delete("/api/v1/me/decisions").status_code==204
    assert authed.get("/api/v1/decisions").json()["items"]==[]


def test_history_cursor_autosave_and_single_delete(authed,decision_body):
    made=[]
    for number in range(3):
        response=create_decision(authed,{**decision_body,"question":f"Should I make choice number {number}?"}).json()
        wait_complete(authed,response["runId"]); made.append(response)
    hidden=create_decision(authed,{**decision_body,"question":"Should this stay temporary?","autoSave":False}).json()
    wait_complete(authed,hidden["runId"])
    first=authed.get("/api/v1/decisions?limit=2").json()
    second=authed.get(f"/api/v1/decisions?limit=2&cursor={first['nextCursor']}").json()
    assert len(first["items"])==2 and len(second["items"])==1
    assert authed.delete(f"/api/v1/decisions/{made[0]['decisionId']}").status_code==204
    assert authed.get(f"/api/v1/decisions/{made[0]['decisionId']}").status_code==404


def test_cors_allowlist(client):
    response=client.options("/api/v1/me",headers={"Origin":"http://localhost:5173","Access-Control-Request-Method":"GET"})
    assert response.status_code==200 and response.headers["access-control-allow-origin"]=="http://localhost:5173"
