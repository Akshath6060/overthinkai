import json
import httpx

from app.ai.gemini_provider import GeminiProvider


async def test_gemini_provider_parses_structured_output_without_exposing_key():
    def handler(request: httpx.Request):
        assert request.headers.get("x-goog-api-key") == "test-key"
        payload=json.loads(request.content)
        assert payload["generationConfig"]["responseMimeType"]=="application/json"
        return httpx.Response(200,json={
            "candidates":[{"content":{"parts":[{"text":json.dumps({"analysis":"A question-specific visible answer.","verdict":"PROCEED","confidence":82})}]}}],
            "usageMetadata":{"promptTokenCount":12,"candidatesTokenCount":8},
        })
    client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    provider=GeminiProvider("test-key","gemini-2.5-flash","gemini-2.5-flash",client)
    output,usage=await provider.analyze("Should I change jobs?",{"name":"Risk Analyst","personality":"Cautious","instructions":"Assess reversible risks."},"SEVERE","Dry")
    assert output.analysis.startswith("A question-specific")
    assert output.confidence==82 and usage["inputTokens"]==12
    await client.aclose()


async def test_gemini_provider_falls_back_after_retryable_capacity_errors(monkeypatch):
    calls=[]
    async def no_sleep(_): return None
    monkeypatch.setattr("app.ai.gemini_provider.asyncio.sleep",no_sleep)
    def handler(request: httpx.Request):
        calls.append(str(request.url))
        if "gemini-primary" in str(request.url):
            return httpx.Response(503,json={"error":{"status":"UNAVAILABLE"}})
        return httpx.Response(200,json={
            "candidates":[{"content":{"parts":[{"text":json.dumps({"analysis":"Fallback answer.","verdict":"PROCEED","confidence":75})}]}}],
            "usageMetadata":{},
        })
    client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    provider=GeminiProvider("test-key","gemini-primary","gemini-primary",client,fallback_model="gemini-fallback")
    output,_=await provider.analyze("Should I retry?",{"name":"Risk Analyst","personality":"Cautious","instructions":"Assess risks."},"NORMAL","Dry")
    assert output.analysis=="Fallback answer."
    assert len([url for url in calls if "gemini-primary" in url])==3
    assert "gemini-fallback" in calls[-1]
    await client.aclose()
