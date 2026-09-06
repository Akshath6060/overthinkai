import json
import httpx

from app.ai.gemini_provider import GeminiProvider


async def test_gemini_provider_parses_structured_output_without_exposing_key():
    def handler(request: httpx.Request):
        assert request.headers.get("x-goog-api-key") == "test-key"
        payload=json.loads(request.content)
        assert payload["generationConfig"]["responseMimeType"]=="application/json"
        assert "temperature" not in payload["generationConfig"]
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
    assert len([url for url in calls if "gemini-primary" in url])==2
    assert "gemini-fallback" in calls[-1]
    await client.aclose()


async def test_gemini_provider_retries_invalid_structured_response(monkeypatch):
    calls=[]
    async def no_sleep(_): return None
    monkeypatch.setattr("app.ai.gemini_provider.asyncio.sleep",no_sleep)
    def handler(request: httpx.Request):
        calls.append(str(request.url))
        if len(calls)==1:
            return httpx.Response(200,json={"candidates":[]})
        return httpx.Response(200,json={
            "candidates":[{"content":{"parts":[{"text":json.dumps({"analysis":"Recovered answer.","verdict":"PROCEED","confidence":78})}]}}],
            "usageMetadata":{},
        })
    client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    provider=GeminiProvider("test-key","gemini-primary","gemini-primary",client)
    output,_=await provider.analyze("Should I retry?",{"name":"Risk Analyst","personality":"Cautious","instructions":"Assess risks."},"NORMAL","Dry")
    assert output.analysis=="Recovered answer."
    assert len(calls)==2
    await client.aclose()


async def test_gemini_provider_fails_over_immediately_for_missing_model(monkeypatch):
    calls=[]
    async def no_sleep(_): return None
    monkeypatch.setattr("app.ai.gemini_provider.asyncio.sleep",no_sleep)
    def handler(request: httpx.Request):
        calls.append(str(request.url))
        if "gemini-missing" in str(request.url):
            return httpx.Response(404,json={"error":{"status":"NOT_FOUND"}})
        return httpx.Response(200,json={
            "candidates":[{"content":{"parts":[{"text":json.dumps({"analysis":"Fallback answer.","verdict":"PROCEED","confidence":75})}]}}],
            "usageMetadata":{},
        })
    client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    provider=GeminiProvider("test-key","gemini-missing","gemini-missing",client,fallback_model="gemini-fallback")
    output,_=await provider.analyze("Should I retry?",{"name":"Risk Analyst","personality":"Cautious","instructions":"Assess risks."},"NORMAL","Dry")
    assert output.analysis=="Fallback answer."
    assert len(calls)==2
    await client.aclose()


async def test_gemini_provider_reads_google_retry_info():
    response=httpx.Response(429,json={
        "error":{"details":[{"@type":"type.googleapis.com/google.rpc.RetryInfo","retryDelay":"20.75s"}]}
    })
    assert GeminiProvider._retry_delay(response,0)==20.75


async def test_gemini_provider_rotates_across_multiple_quota_limited_models(monkeypatch):
    calls=[]
    async def no_sleep(_): return None
    monkeypatch.setattr("app.ai.gemini_provider.asyncio.sleep",no_sleep)
    def handler(request: httpx.Request):
        model=str(request.url).split("/models/",1)[1].split(":",1)[0]
        calls.append(model)
        if model != "gemini-third":
            return httpx.Response(429,json={"error":{"status":"RESOURCE_EXHAUSTED"}})
        return httpx.Response(200,json={
            "candidates":[{"content":{"parts":[{"text":json.dumps({"analysis":"Third model answered.","verdict":"PROCEED","confidence":80})}]}}],
            "usageMetadata":{},
        })
    client=httpx.AsyncClient(transport=httpx.MockTransport(handler))
    provider=GeminiProvider("test-key","gemini-primary","gemini-primary",client,fallback_model="gemini-second,gemini-third")
    output,_=await provider.analyze("Should I rotate?",{"name":"Risk Analyst","personality":"Cautious","instructions":"Assess risks."},"NORMAL","Dry")
    assert output.analysis=="Third model answered."
    assert calls==["gemini-primary","gemini-second","gemini-third"]
    await client.aclose()
