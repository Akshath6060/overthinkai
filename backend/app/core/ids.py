import secrets


def new_id(prefix: str) -> str:
    return f"{prefix}_{secrets.token_urlsafe(16).rstrip('=')}"

