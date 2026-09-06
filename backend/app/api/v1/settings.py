from fastapi import APIRouter, Depends, Request
from app.api.deps import current_user
from app.schemas.common import utcnow
from app.schemas.settings import SettingsPatch

router = APIRouter(prefix="/settings", tags=["settings"])


def clean(doc): return {k:v for k,v in doc.items() if k not in {"_id","userId","updatedAt"}}


@router.get("")
async def get_settings(request: Request, user=Depends(current_user)):
    return clean(await request.app.state.store.find_one("user_settings", {"userId":user["id"]}))


@router.patch("")
async def patch_settings(body: SettingsPatch, request: Request, user=Depends(current_user)):
    values = body.model_dump(by_alias=True, exclude_none=True)
    if values:
        await request.app.state.store.update_one("user_settings", {"userId":user["id"]}, {"$set":{**values,"updatedAt":utcnow()}})
    return clean(await request.app.state.store.find_one("user_settings", {"userId":user["id"]}))

