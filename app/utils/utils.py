from datetime import datetime, timezone


def date_now():
    return datetime.now(timezone.utc)
