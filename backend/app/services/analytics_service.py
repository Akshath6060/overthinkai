from collections import Counter, defaultdict
from datetime import date, datetime, time, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from app.core.errors import AppError


def parse_range(from_value: date | None, to_value: date | None, timezone_name: str):
    try: zone=ZoneInfo(timezone_name)
    except ZoneInfoNotFoundError as exc: raise AppError(422,"INVALID_TIMEZONE","Unknown IANA timezone.") from exc
    today=datetime.now(zone).date(); end_date=to_value or today; start_date=from_value or end_date-timedelta(days=6)
    if start_date>end_date or (end_date-start_date).days>366: raise AppError(422,"INVALID_DATE_RANGE","Date range must be ordered and no longer than 366 days.")
    start=datetime.combine(start_date,time.min,zone).astimezone(timezone.utc)
    end=datetime.combine(end_date+timedelta(days=1),time.min,zone).astimezone(timezone.utc)
    return zone,start_date,end_date,start,end


async def analytics(store,user_id,from_value,to_value,timezone_name):
    zone,start_date,end_date,start,end=parse_range(from_value,to_value,timezone_name)
    match={"userId":user_id,"saved":True,"createdAt":{"$gte":start,"$lt":end}}
    # Mongo deployments use an aggregation pipeline for the primary dimensions.
    if hasattr(store,"db"):
        pipeline=[{"$match":match},{"$facet":{"categories":[{"$group":{"_id":"$category","count":{"$sum":1}}}],"daily":[{"$group":{"_id":{"$dateToString":{"format":"%Y-%m-%d","date":"$createdAt","timezone":timezone_name}},"count":{"$sum":1}}},{"$sort":{"_id":1}}]}}]
        facet=(await store.db.decisions.aggregate(pipeline).to_list(length=1))[0]
        category_counts=Counter({x["_id"]:x["count"] for x in facet["categories"]})
        daily_counts=Counter({x["_id"]:x["count"] for x in facet["daily"]})
        decisions=await store.find_many("decisions",match)
    else:
        decisions=await store.find_many("decisions",match)
        category_counts=Counter(d["category"] for d in decisions)
        daily_counts=Counter(d["createdAt"].astimezone(zone).date().isoformat() for d in decisions)
    runs=[]
    for d in decisions:
        run=await store.find_one("analysis_runs",{"_id":d["runId"],"status":"completed"})
        if run: runs.append(run)
    n=len(decisions); completed=len(runs)
    agent_counts=[]; agent_usage=defaultdict(lambda:{"runCount":0,"name":"","dramaScore":0})
    for run in runs:
        agents=await store.find_many("run_agents",{"runId":run["id"],"role":"analyst"})
        agent_counts.append(len(agents))
        for a in agents:
            item=agent_usage[a["originalAgentId"]]; item["runCount"]+=1; item["name"]=a["name"]; item["dramaScore"]=a.get("dramaScore",0)
    total=sum(category_counts.values())
    all_dates=[start_date+timedelta(days=i) for i in range((end_date-start_date).days+1)]
    span=end-start; previous_count=await store.count("decisions",{"userId":user_id,"saved":True,"createdAt":{"$gte":start-span,"$lt":start}})
    summary={"decisionCount":n,"decisionCountDelta":n-previous_count,"averageAgentCount":round(sum(agent_counts)/len(agent_counts),2) if agent_counts else 0,"totalTokens":sum(r["usage"]["totalTokens"] for r in runs),"totalDurationMs":sum(r["usage"]["durationMs"] for r in runs),"averageConfidence":round(sum(r["finalVerdict"]["confidence"] for r in runs)/completed,2) if completed else 0,"averageDifficulty":round(sum(r["metrics"].get("actualDifficulty",0) for r in runs)/completed,2) if completed else 0}
    return {"range":{"from":start_date.isoformat(),"to":end_date.isoformat(),"timezone":timezone_name},"summary":summary,"daily":[{"date":d.isoformat(),"count":daily_counts[d.isoformat()]} for d in all_dates],"categories":[{"category":cat,"count":count,"percentage":round(count*100/total,2) if total else 0} for cat,count in category_counts.most_common()],"agents":[{"agentId":aid,**values} for aid,values in agent_usage.items()]}
