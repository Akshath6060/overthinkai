from app.core.errors import AppError
from app.core.ids import new_id
from app.schemas.common import utcnow


SYSTEM_AGENTS = [
    {"id":"agent_finance","name":"Financial Analyst","emoji":"🤑","color":"#FFD84D","tagline":"Professional penny counter","personality":"Treats every rupee as a leading economic indicator.","instructions":"Assess affordability, opportunity cost, and practical financial limits.","role":"analyst","dramaScore":58,"usefulnessScore":76,"confidenceProfile":87,"knowledgeLabel":"Suspiciously specific"},
    {"id":"agent_risk","name":"Risk Analyst","emoji":"🚨","color":"#FF4D4D","tagline":"Sees danger everywhere","personality":"Assumes everything could go wrong, because technically it could.","instructions":"Identify meaningful downsides, their reversibility, and mitigations without catastrophizing.","role":"analyst","dramaScore":88,"usefulnessScore":72,"confidenceProfile":74,"knowledgeLabel":"Fear-based"},
    {"id":"agent_emotion","name":"Emotional Analyst","emoji":"😭","color":"#FF4FA3","tagline":"Powered entirely by vibes","personality":"Reads between lines that were never written.","instructions":"Assess motivations, feelings, regret, and whether the user already knows what they want.","role":"analyst","dramaScore":71,"usefulnessScore":64,"confidenceProfile":96,"knowledgeLabel":"Emotionally accurate"},
    {"id":"agent_practical","name":"Practical Analyst","emoji":"🤓","color":"#4CC9F0","tagline":"Already tired of this","personality":"The one making sense. Nobody listens.","instructions":"Recommend the simplest actionable and reversible approach.","role":"analyst","dramaScore":19,"usefulnessScore":91,"confidenceProfile":81,"knowledgeLabel":"Actually fine"},
    {"id":"agent_devil","name":"Devil's Advocate","emoji":"😈","color":"#8B5CF6","tagline":"Disagrees recreationally","personality":"Contrarian as a service. Bills hourly.","instructions":"Challenge consensus with one credible counterargument, not fabricated facts.","role":"analyst","dramaScore":97,"usefulnessScore":48,"confidenceProfile":61,"knowledgeLabel":"Questionable"},
    {"id":"agent_judge","name":"Final Judge","emoji":"⚖️","color":"#B7F34A","tagline":"Pretends to have authority","personality":"Calm, final, and mildly tired of everyone here.","instructions":"Synthesize visible analyst outputs into a decisive, useful verdict.","role":"judge","dramaScore":44,"usefulnessScore":87,"confidenceProfile":88,"knowledgeLabel":"Borrowed"},
]

PRESETS = [
    {"id":"preset_mom","name":"Mom","emoji":"👩","tagline":"Asks if there is food at home","personality":"Warm, but fiscally merciless.","instructions":"Ask whether an existing option already solves the problem."},
    {"id":"preset_friend","name":"Friend","emoji":"🤝","tagline":"Bro, just do it","personality":"Supportive and suspiciously decisive.","instructions":"Favor reasonable action over endless rumination."},
    {"id":"preset_sleepy","name":"Sleep-Deprived Me","emoji":"🌙","tagline":"Tomorrow-you has notes","personality":"Honest, tired, occasionally profound.","instructions":"Check whether sleep should precede this decision."},
]


def public_agent(agent: dict, pref: dict | None = None) -> dict:
    result = {k: v for k, v in agent.items() if k not in {"_id", "ownerUserId", "instructions", "createdAt", "updatedAt"}}
    result.update({"ownership": "system" if agent.get("ownerUserId") is None else "user", "editable": agent.get("ownerUserId") is not None, "deletable": agent.get("ownerUserId") is not None, "instructionVersion": agent.get("instructionVersion", "1")})
    result["enabled"] = pref.get("enabled", True) if pref else agent.get("enabled", True)
    result["position"] = pref.get("position", agent.get("position", 0)) if pref else agent.get("position", 0)
    if agent.get("ownerUserId") is not None:
        result["instructions"] = agent.get("instructions", "")
    return result


async def seed_system_agents(store):
    for position, item in enumerate(SYSTEM_AGENTS):
        if not await store.find_one("agents", {"_id": item["id"]}):
            await store.insert("agents", {"_id": item["id"], **item, "ownerUserId": None, "enabled": True, "position": position, "instructionVersion":"1", "createdAt":utcnow()})


async def effective_agents(store, user_id: str) -> list[dict]:
    base = await store.find_many("agents", {"ownerUserId": {"$in": [None, user_id]}})
    prefs = {p["agentId"]: p for p in await store.find_many("user_agent_preferences", {"userId": user_id})}
    agents = sorted((public_agent(a, prefs.get(a["id"])) for a in base), key=lambda a: a["position"])
    order = await store.find_one("user_agent_order", {"userId": user_id})
    if order:
        positions = {agent_id: position for position, agent_id in enumerate(order["agentIds"])}
        agents.sort(key=lambda a: positions.get(a["id"], len(positions) + a["position"]))
        for position, agent in enumerate(agents): agent["position"] = position
    return agents


async def resolve_agents(store, user_id: str, ids: list[str]) -> list[dict]:
    docs = []
    prefs = {p["agentId"]:p for p in await store.find_many("user_agent_preferences", {"userId":user_id})}
    for agent_id in ids:
        agent = await store.find_one("agents", {"_id":agent_id})
        if not agent or agent.get("ownerUserId") not in (None, user_id):
            raise AppError(422, "INVALID_AGENT", "One or more selected agents are unavailable.", {"agentId":agent_id})
        pref = prefs.get(agent_id, {})
        if not pref.get("enabled", agent.get("enabled", True)):
            raise AppError(422, "AGENT_DISABLED", "A selected agent is disabled.", {"agentId":agent_id})
        docs.append(agent)
    analysts = [a for a in docs if a["role"] == "analyst"]
    judges = [a for a in docs if a["role"] == "judge"]
    if not analysts or len(judges) != 1:
        raise AppError(422, "INVALID_COUNCIL", "Select at least one analyst and exactly one final judge.")
    return docs
