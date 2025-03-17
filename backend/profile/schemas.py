from typing import Dict, Optional, List
from pydantic import BaseModel

class ProfileResponse(BaseModel):
    status: str
    data: Dict

class ProfileUpdateRequest(BaseModel):
    fullname: Optional[str] = None
    password: Optional[str] = None
    avatar_url: Optional[str] = None

class PlaylistResponse(BaseModel):
    status: str
    data: Dict

class PlaylistRequest(BaseModel):
    name: str
    description: Optional[str] = None