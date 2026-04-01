from pydantic import BaseModel, ConfigDict, HttpUrl

class URLCreate(BaseModel):
    url: HttpUrl

class URLResponse(BaseModel):
    id: int
    original_url: str
    short_code: str

    model_config = ConfigDict(from_attributes=True)
