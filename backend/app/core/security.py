import hashlib
import hmac
import secrets


def issue_session_token() -> str:
    return secrets.token_urlsafe(48)


def hash_token(token: str, secret: str) -> str:
    return hmac.new(secret.encode(), token.encode(), hashlib.sha256).hexdigest()

