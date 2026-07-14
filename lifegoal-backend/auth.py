"""
Telegram WebApp authentication.

The frontend (Telegram Mini App) must send the raw `initData` string that
Telegram gives it via `WebApp.initData`, in a header on every request:

    X-Telegram-Init-Data: <window.Telegram.WebApp.initData>

We validate it here using the official algorithm (HMAC-SHA256 against your
bot token) so a request can't be forged, and use the verified Telegram user
id to scope every query. Without this, every route in the app was reading
and writing one shared, global dataset for anyone who opened the URL.

Docs: https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
"""
import hashlib
import hmac
import json
import os
import time
from urllib.parse import parse_qsl

from fastapi import Header, HTTPException

BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN", "")

# initData older than this is rejected to limit replay of a leaked header.
MAX_INIT_DATA_AGE_SECONDS = 24 * 60 * 60

# Sessions rely only on Telegram's initData, so this offers no way to bypass
# validation in production. It is here purely so `uvicorn main:app --reload`
# keeps working before you've set TELEGRAM_BOT_TOKEN and a real Mini App URL.
DEV_FALLBACK_USER_ID = -1


def _validate_init_data(init_data: str) -> dict:
    if not BOT_TOKEN:
        raise HTTPException(
            status_code=500,
            detail="TELEGRAM_BOT_TOKEN is not configured on the server",
        )

    parsed = dict(parse_qsl(init_data, strict_parsing=True))
    received_hash = parsed.pop("hash", None)
    if not received_hash:
        raise HTTPException(status_code=401, detail="Missing hash in initData")

    auth_date = parsed.get("auth_date")
    if not auth_date or (time.time() - int(auth_date)) > MAX_INIT_DATA_AGE_SECONDS:
        raise HTTPException(status_code=401, detail="initData expired, reopen the app")

    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed.items()))
    secret_key = hmac.new(b"WebAppData", BOT_TOKEN.encode(), hashlib.sha256).digest()
    computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if not hmac.compare_digest(computed_hash, received_hash):
        raise HTTPException(status_code=401, detail="Invalid initData signature")

    return parsed


def get_current_user_id(x_telegram_init_data: str = Header(default="")) -> int:
    """FastAPI dependency: use as `user_id: int = Depends(get_current_user_id)`."""
    if not x_telegram_init_data:
        if os.getenv("ENVIRONMENT", "production") == "development":
            return DEV_FALLBACK_USER_ID
        raise HTTPException(status_code=401, detail="Missing X-Telegram-Init-Data header")

    parsed = _validate_init_data(x_telegram_init_data)
    user_raw = parsed.get("user")
    if not user_raw:
        raise HTTPException(status_code=401, detail="No user in initData")

    try:
        user = json.loads(user_raw)
        return int(user["id"])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(status_code=401, detail="Malformed user in initData")
