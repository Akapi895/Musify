from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import aiosqlite
from pydantic import BaseModel


from ..auth.controllers import get_session_user_id
from .services import get_featured_songs, get_new_releases, get_top_favorites

router = APIRouter()

# Define the response model correctly using Pydantic
class SongListData(BaseModel):
    songs: List[Dict[str, Any]]

class SongListResponse(BaseModel):
    status: str
    data: SongListData

# Featured songs endpoint
@router.get("/featured", response_model=SongListResponse)
async def featured_songs():
    """Get featured songs for the home page"""
    try:
        songs = await get_featured_songs()
        return {"status": "success", "data": {"songs": songs}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured songs: {str(e)}")

@router.get("/new-releases", response_model=SongListResponse)
async def new_releases():
    try:
        songs = await get_new_releases()
        return {"status": "success", "data": {"songs": songs}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch new releases: {str(e)}")

@router.get("/favorites/top", response_model=SongListResponse)
async def top_favorites(limit: Optional[int] = Query(5, description="Number of songs to return")):
    try:
        songs = await get_top_favorites(limit=limit)
        return {"status": "success", "data": {"songs": songs}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch featured songs: {str(e)}")