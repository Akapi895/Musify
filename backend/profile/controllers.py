from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, Dict
from .schemas import ProfileResponse, ProfileUpdateRequest, PlaylistResponse, PlaylistRequest
from .services import (
    get_user_profile, get_user_playlists,
    create_playlist, add_song_to_playlist, remove_song_from_playlist
)
import asyncio
from ..auth.controllers import get_session_user_id

router = APIRouter()

# Middleware để xác thực người dùng
async def get_current_user_id():
    user_id = await get_session_user_id()
    if user_id is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user_id

# API lấy thông tin profile
@router.get("/me", response_model=ProfileResponse)
async def get_profile():
    user_id = await get_current_user_id()
    profile = await get_user_profile(user_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    return {"status": "success", "data": profile}

# chưa dùng vội
@router.put("/", response_model=ProfileResponse)
async def update_profile(profile_data: ProfileUpdateRequest):
    user_id = await get_current_user_id()
    
    updated_profile = await get_user_profile(user_id)
    return {"status": "success", "data": updated_profile}

@router.get("/playlists", response_model=PlaylistResponse)
async def get_playlists():
    user_id = await get_current_user_id()
    playlists = await get_user_playlists(user_id)
    return {"status": "success", "data": {"playlists": playlists}}

# tạo playlist mới
@router.post("/playlists/create", response_model=PlaylistResponse)
async def create_new_playlist(playlist: PlaylistRequest):
    user_id = await get_current_user_id()
    playlist_id = await create_playlist(user_id, playlist.name, playlist.description)
    
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Failed to create playlist")
    
    return {
        "status": "success", 
        "data": {
            "playlist_id": playlist_id,
            "message": "Playlist created successfully"
        }
    }

# thêm bài vào playlist
@router.post("/playlists/add/{playlist_id}/songs/{song_id}", response_model=PlaylistResponse)
async def add_song(playlist_id: int, song_id: int):
    user_id = await get_current_user_id()
        
    success = await add_song_to_playlist(playlist_id, song_id, user_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to add song to playlist")
    
    return {
        "status": "success", 
        "message": "Song added to playlist successfully"
    }

# xóa bài khỏi playlist
@router.delete("/playlists/delete/{playlist_id}/songs/{song_id}", response_model=PlaylistResponse)
async def remove_song(playlist_id: int, song_id: int):
    user_id = await get_current_user_id()
            
    success = await remove_song_from_playlist(playlist_id, song_id, user_id)
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to remove song from playlist")
    
    return {
        "status": "success", 
        "message": "Song removed from playlist successfully"
    }