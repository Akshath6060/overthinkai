from app.core.errors import AppError
from app.core.ids import new_id
from app.schemas.common import utcnow


async def balance(store, user_id: str) -> int:
    entries = await store.find_many("credit_ledger", {"userId": user_id})
    return sum(int(e["amount"]) for e in entries)


async def add_entry(store, user_id: str, amount: int, reason: str, ref: str, run_id: str | None = None):
    existing = await store.find_one("credit_ledger", {"idempotencyRef": ref})
    if existing:
        return existing
    doc = {"_id":new_id("cr"), "id":None, "userId":user_id, "amount":amount, "reason":reason, "runId":run_id, "idempotencyRef":ref, "createdAt":utcnow()}
    doc["id"] = doc["_id"]
    await store.insert("credit_ledger", doc)
    return doc


async def reserve(store, user_id: str, run_id: str, cost: int):
    if await balance(store, user_id) < cost:
        raise AppError(403, "INSUFFICIENT_CREDITS", "You do not have enough credits for this run.")
    return await add_entry(store, user_id, -cost, "run_reservation", f"reserve:{run_id}", run_id)


async def refund(store, user_id: str, run_id: str, cost: int, reason="run_refund"):
    return await add_entry(store, user_id, cost, reason, f"refund:{run_id}", run_id)

