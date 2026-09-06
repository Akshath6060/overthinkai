from pymongo import ASCENDING, DESCENDING, IndexModel


async def ensure_indexes(store) -> None:
    if not hasattr(store, "db"):
        return
    definitions = {
        "sessions": [IndexModel("tokenHash", unique=True), IndexModel("expiresAt", expireAfterSeconds=0)],
        "decisions": [IndexModel([("userId", ASCENDING), ("createdAt", DESCENDING)]), IndexModel([("userId", ASCENDING), ("severity", ASCENDING), ("createdAt", DESCENDING)]), IndexModel([("userId", ASCENDING), ("idempotencyKey", ASCENDING)], unique=True)],
        "analysis_runs": [IndexModel([("userId", ASCENDING), ("createdAt", DESCENDING)]), IndexModel("decisionId"), IndexModel("status")],
        "run_agents": [IndexModel([("runId", ASCENDING), ("position", ASCENDING)], unique=True)],
        "run_events": [IndexModel([("runId", ASCENDING), ("sequence", ASCENDING)], unique=True), IndexModel([("runId", ASCENDING), ("createdAt", ASCENDING)])],
        "agents": [IndexModel("ownerUserId")],
        "credit_ledger": [IndexModel([("userId", ASCENDING), ("createdAt", DESCENDING)]), IndexModel("idempotencyRef", unique=True)],
        "user_settings": [IndexModel("userId", unique=True)],
        "user_agent_preferences": [IndexModel([("userId", ASCENDING), ("agentId", ASCENDING)], unique=True)],
    }
    for name, indexes in definitions.items():
        await store.db[name].create_indexes(indexes)

