import hashlib
from app.schemas.ai import AnalystOutput, JudgeOutput
from .provider import AIProvider


class MockProvider(AIProvider):
    """Question-specific, deterministic provider for tests and deliberate demos."""
    async def analyze(self, question, agent, severity, humor_level):
        seed = int(hashlib.sha256(f"{question}|{agent['id']}".encode()).hexdigest()[:8], 16)
        confidence = 55 + seed % 43
        subject = question.rstrip(" ?.!")
        angle = {
            "agent_finance": "The budget impact looks survivable, assuming this does not become a subscription.",
            "agent_risk": "The downside exists, but appears less dramatic than the committee assembled to discuss it.",
            "agent_emotion": "Your phrasing suggests the decision was emotionally made before this hearing began.",
            "agent_practical": "The simplest reversible option is probably the right one; set a limit and proceed.",
            "agent_devil": "Consensus deserves one ceremonial objection, so consider the opportunity cost once more.",
        }.get(agent["id"], f"From the perspective of {agent['name']}, the trade-offs are manageable.")
        verdicts = ["PROBABLY FINE", "PROCEED, CAUTIOUSLY", "VIBES APPROVED", "UNNECESSARILY COMPLICATED"]
        output = AnalystOutput(analysis=f"Regarding ‘{subject}’: {angle}", verdict=verdicts[seed % len(verdicts)], confidence=confidence)
        tokens = max(20, len(question.split()) * 4 + 35)
        return output, {"inputTokens": tokens, "outputTokens": 45, "estimatedCostMinor": 1, "currency": "INR"}

    async def judge(self, question, agent, results, severity, humor_level):
        confidence = round(sum(r["confidence"] for r in results) / len(results)) if results else 0
        negative = [r for r in results if "NOT" in r["verdict"] or "CAUT" in r["verdict"]]
        clean = question.rstrip(" ?.!")
        output = JudgeOutput(
            headline=f"YES—MAKE THE CALL ON ‘{clean.upper()}’." if len(negative) <= len(results)/2 else f"PAUSE BEFORE YOU {clean.upper()}.",
            explanation=f"The council reviewed {len(results)} visible analyses. The reversible choice wins; use reasonable limits, then stop convening committees for it.",
            confidence=confidence,
            approve_count=len(results)-len(negative), disapprove_count=len(negative),
            dissenting_agent_ids=[r["agentId"] for r in negative],
        )
        return output, {"inputTokens": 80 + len(results)*35, "outputTokens": 65, "estimatedCostMinor": 2, "currency": "INR"}

