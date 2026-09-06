from datetime import date
from fastapi import APIRouter, Depends, Query, Request
from app.api.deps import current_user
from app.services.analytics_service import analytics

router=APIRouter(prefix="/analytics",tags=["analytics"])


@router.get("")
async def get_analytics(request:Request,from_value:date|None=Query(default=None,alias="from"),to:date|None=None,timezone:str="Asia/Kolkata",user=Depends(current_user)):
    return await analytics(request.app.state.store,user["id"],from_value,to,timezone)
