from datetime import datetime, timezone
import geoip2.database
from user_agents import parse


def date_now():
    return datetime.now(timezone.utc)


def get_country(ip_address: str) -> str:
    if not ip_address:
        return "Unknown"

    try:
        with geoip2.database.Reader("app/geoip/GeoLite2-Country.mmdb") as reader:
            response = reader.country(ip_address)
            return response.country.name or "Unknown"
    except Exception:
        return "Unknown"


def parse_user_agent(user_agent_str: str | None):
    if not user_agent_str:
        return {
            "device": "Unknown",
            "browser": "Unknown",
            "os": "Unknown",
        }

    try:
        ua = parse(user_agent_str)

        return {
            "device": (
                "Mobile" if ua.is_mobile else "Tablet" if ua.is_tablet else "PC"
            ),
            "browser": ua.browser.family or "Unknown",
            "os": ua.os.family or "Unknown",
        }
    except Exception:
        return {
            "device": "Unknown",
            "browser": "Unknown",
            "os": "Unknown",
        }
