import json
import logging
import sys
from datetime import datetime, timezone


def configure_logging(level: str) -> None:
    logging.basicConfig(stream=sys.stdout, level=level.upper(), format="%(message)s", force=True)


def log_event(event: str, **fields) -> None:
    timestamp = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    logging.getLogger("overthinker").info(json.dumps({"timestamp": timestamp, "event": event, **fields}, default=str))
