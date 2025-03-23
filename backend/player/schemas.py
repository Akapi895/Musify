from typing import Optional, Dict
from pydantic import BaseModel

class SongBase(BaseModel):
    title: str
    artist: str
    duration: int
    file_url: str
    release_date: Optional[str] = None
    lyrics: Optional[str] = None

class SongCreate(SongBase):
    pass

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    release_date: Optional[str] = None
    file_url: Optional[str] = None
    lyrics: Optional[str] = None

class SongListResponse(BaseModel):
    status: str
    data: list

class SongResponse(BaseModel):
    status: str
    favor: bool

class PlaylistRequest(BaseModel):
    name: str
    description: Optional[str] = None

class PlaylistResponse(BaseModel):
    status: str
    data: Dict

class PlaylistSongResponse(BaseModel):
    status: str
    data: Dict[str, list]

class FavoutiteResponse(BaseModel):
    status: str
    data: Dict[str, list]