from hashids import Hashids
from app.core.config import settings
import string

hashids = Hashids(
    salt=settings.HASHIDS_SALT,
    min_length=6
)

def encode_id(id: int) -> str:
    return hashids.encode(id)

def decode_code(code: str) -> int | None:
    decoded = hashids.decode(code)
    return decoded[0] if decoded else None


BASE62 = string.digits + string.ascii_letters

def encode_base62(num: int) -> str:
    if num == 0:
        return BASE62[0]

    base62 = []
    base = len(BASE62)

    while num > 0:
        num, rem = divmod(num, base)
        base62.append(BASE62[rem])

    return ''.join(reversed(base62))


def decode_base62(short_code: str) -> int:
    base = len(BASE62)
    num = 0

    for char in short_code:
        num = num * base + BASE62.index(char)

    return num
