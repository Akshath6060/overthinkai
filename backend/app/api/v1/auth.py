from fastapi import APIRouter, Depends, Request, Response
from app.api.deps import current_user
from app.services.auth_service import create_guest, create_session, me_payload, resolve_session, revoke_session

router = APIRouter(prefix="/auth", tags=["authentication"])


@router.post("/guest", summary="Create or resume a guest session")
async def guest(request: Request, response: Response):
    await request.app.state.limiter.check(f"guest:{request.client.host if request.client else 'unknown'}", 10, 60)
    old = request.cookies.get("ot_session")
    user = await resolve_session(request.app.state.store, old, request.app.state.settings)
    if not user:
        user = await create_guest(request.app.state.store, request.app.state.settings)
        token = await create_session(request.app.state.store, user["id"], request.app.state.settings)
        response.set_cookie("ot_session", token, max_age=request.app.state.settings.session_expire_days*86400, httponly=True, secure=request.app.state.settings.cookie_secure, samesite=request.app.state.settings.cookie_samesite, path="/")
    return await me_payload(request.app.state.store, user, request.app.state.settings)


@router.post("/logout", status_code=204, summary="Revoke the current session")
async def logout(request: Request, response: Response, user=Depends(current_user)):
    await revoke_session(request.app.state.store, request.cookies.get("ot_session"), request.app.state.settings)
    response.delete_cookie("ot_session", path="/", secure=request.app.state.settings.cookie_secure, samesite=request.app.state.settings.cookie_samesite)

