from datetime import timedelta

from app.core.ids import new_id
from app.core.security import hash_token, issue_session_token
from app.schemas.common import utcnow
from app.schemas.settings import UserSettings
from .credit_service import add_entry, balance


async def create_guest(store, settings):
    now = utcnow()
    user_id = new_id("usr")
    user = {"_id":user_id,"id":user_id,"displayName":"Professional Overthinker","initials":"PO","email":None,"guest":True,"createdAt":now}
    await store.insert("users", user)
    defaults = UserSettings().model_dump(by_alias=True)
    await store.insert("user_settings", {"_id":user_id,"userId":user_id,**defaults,"updatedAt":now})
    await add_entry(store, user_id, settings.default_credit_allowance, "initial_allowance", f"allowance:{user_id}")
    return user


async def create_session(store, user_id: str, settings):
    token = issue_session_token()
    now = utcnow()
    session_id = new_id("ses")
    await store.insert("sessions", {"_id":session_id,"id":session_id,"userId":user_id,"tokenHash":hash_token(token, settings.session_secret),"createdAt":now,"expiresAt":now+timedelta(days=settings.session_expire_days),"revokedAt":None})
    return token


async def resolve_session(store, token: str | None, settings):
    if not token: return None
    session = await store.find_one("sessions", {"tokenHash":hash_token(token, settings.session_secret),"revokedAt":None})
    if not session or session["expiresAt"] <= utcnow(): return None
    return await store.find_one("users", {"_id":session["userId"]})


async def revoke_session(store, token: str | None, settings):
    if token:
        await store.update_one("sessions", {"tokenHash":hash_token(token, settings.session_secret)}, {"$set":{"revokedAt":utcnow()}})


async def me_payload(store, user: dict, settings):
    prefs = await store.find_one("user_settings", {"userId":user["id"]}) or {}
    used = settings.default_credit_allowance - await balance(store, user["id"])
    history = await store.count("decisions", {"userId":user["id"],"saved":True})
    return {"user":{k:v for k,v in user.items() if k != "_id"},"plan":{"name":"Free","creditAllowance":settings.default_credit_allowance,"creditsUsed":max(0, used),"creditsRemaining":max(0, settings.default_credit_allowance-used),"resetAt":None},"settings":{k:v for k,v in prefs.items() if k not in {"_id","userId","updatedAt"}},"historyCount":history}
