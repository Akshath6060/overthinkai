import json
import logging
import sys


def configure_logging(level: str) -> None:
    logging.basicConfig(stream=sys.stdout, level=level.upper(), format="%(message)s", force=True)


def log_event(event: str, **fields) -> None:
    logging.getLogger("overthinker").info(json.dumps({"event": event, **fields}, default=str))

