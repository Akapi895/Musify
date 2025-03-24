from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile, Form
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime
from ..auth.controllers import get_session_user_id
from .services import (
    get_song_by_id, add_song, update_song, 
    delete_song, get_songs_by_user, get_playlist_details,
    add_favorite, remove_favorite, get_favorites, is_favorite,
    create_user_playlist, add_song_to_playlist, remove_song_from_playlist,
    get_playlist_songs, is_song_in_playlist, get_playlists_all
)
from .schemas import SongResponse, SongCreate, SongUpdate, PlaylistRequest, PlaylistResponse, SongListResponse, PlaylistSongResponse, FavoutiteResponse, OneSongResponse

router = APIRouter()

# tested
@router.get("/songs/{player_id}", response_model=OneSongResponse)
async def get_song(player_id: int):
    song = await get_song_by_id(player_id)    
    if not song:
        raise HTTPException(status_code=404, detail="Song not found oh no")
        
    return {"status": "success", "data": song}

# tested
@router.post("/create", response_model=SongResponse)
async def create_song(song: SongCreate):
    user_id = await get_session_user_id()
    
    player_id = await add_song(
        title=song.title,
        artist=song.artist,
        duration=song.duration,
        file_url=song.file_url,
        release_date=song.release_date,
        lyrics=song.lyrics,
        user_id=user_id
    )
    
    if not player_id:
        raise HTTPException(status_code=400, detail="Failed to add song")
        
    new_song = await get_song_by_id(player_id)
    return {"status": "success", "data": new_song}

# tested
@router.put("/update/{player_id}", response_model=SongResponse)
async def update_song_details(player_id: int, song_update: SongUpdate):
    user_id = await get_session_user_id()
    
    current_song = await get_song_by_id(player_id)
    if not current_song:
        raise HTTPException(status_code=404, detail="Song not found")
    
    if current_song["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this song")
    
    success = await update_song(
        player_id=player_id,
        title=song_update.title,
        artist=song_update.artist,
        release_date=song_update.release_date,
        file_url=song_update.file_url,
        lyrics=song_update.lyrics
    )
    
    if not success:
        raise HTTPException(status_code=400, detail="Failed to update song")
        
    updated_song = await get_song_by_id(player_id)
    return {"status": "success", "data": updated_song}

# tested
@router.delete("/delete/{player_id}", response_model=SongResponse)
async def remove_song(player_id: int):
    user_id = await get_session_user_id()
    
    success = await delete_song(player_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Song not found or not authorized to delete")
        
    return {
        "status": "success",
        "data": {
            "message": "Song deleted successfully"
        }
    }

# tested
@router.get("/user/songs", response_model=SongListResponse)
async def get_my_songs():
    user_id = await get_session_user_id()
    
    songs = await get_songs_by_user(user_id)
    return {"status": "success", "data": songs}

# tested
@router.post("/favorites/add/{player_id}", response_model=SongResponse)
async def favorite_song(player_id: int):
    user_id = await get_session_user_id()
    
    success = await add_favorite(user_id, player_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Song not found")
    
    return {
        "status": "success", 
        "favor": True
    }

# tested
@router.delete("/favorites/delete/{player_id}", response_model=SongResponse)
async def unfavorite_song(player_id: int):
    user_id = await get_session_user_id()
    
    success = await remove_favorite(user_id, player_id)
    
    return {
        "status": "success", 
        "favor": True
    }

# tested
@router.get("/favorites/all", response_model=FavoutiteResponse)
async def get_favorite_songs():
    user_id = await get_session_user_id()
    
    songs = await get_favorites(user_id)
    return {"status": "success", "data": {"songs": songs}}

# tested
@router.get("/favorites/status/{player_id}", response_model=SongResponse)
async def check_favorite_status(player_id: int):
    user_id = await get_session_user_id()
    
    favorite = await is_favorite(user_id, player_id)
    return {
        "status": "success", 
        "favor": favorite
    }

# tested
@router.post("/playlist/create", response_model=PlaylistResponse)
async def create_playlist(playlist: PlaylistRequest):
    user_id = await get_session_user_id()
    
    playlist_id = await create_user_playlist(playlist.name, playlist.description, user_id)
    
    if not playlist_id:
        raise HTTPException(status_code=400, detail="Failed to create playlist")
        
    return {"status": "success", "data": {"playlist_id": playlist_id}}

# tested
@router.post("/playlists/add/{playlist_id}/songs/{player_id}", response_model=PlaylistResponse)
async def add_to_playlist(playlist_id: int, player_id: int):
    user_id = await get_session_user_id()
    
    success = await add_song_to_playlist(playlist_id, player_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Song or playlist not found, or you don't have permission")
    
    return {
        "status": "success", 
        "data": {
            "message": "Song added to playlist"
        }
    }

# tested
@router.delete("/playlists/del/{playlist_id}/songs/{player_id}", response_model=PlaylistResponse)
async def remove_from_playlist(playlist_id: int, player_id: int):
    user_id = await get_session_user_id()
    
    success = await remove_song_from_playlist(playlist_id, player_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Song not in playlist, or you don't have permission")
    
    return {
        "status": "success", 
        "data": {
            "message": "Song removed from playlist"
        }
    }

# tested
@router.get("/playlists/{playlist_id}/all", response_model=PlaylistResponse)
async def get_songs_in_playlist(playlist_id: int):
    songs = await get_playlist_songs(playlist_id)
    return {"status": "success", "data": {"songs": songs}}

# tested
@router.get("/playlists/{playlist_id}/songs/{player_id}/status", response_model=PlaylistResponse)
async def check_song_in_playlist(playlist_id: int, player_id: int):
    in_playlist = await is_song_in_playlist(playlist_id, player_id)
    return {
        "status": "success", 
        "data": {
            "in_playlist": in_playlist
        }
    }

@router.get("/playlists/all", response_model=PlaylistSongResponse)
async def get_all_playlists():  
    playlists = await get_playlists_all()
    for playlist in playlists:
        # Get song count for each playlist
        songs = await get_playlist_songs(playlist["playlist_id"])
        playlist["song_count"] = len(songs)
        
        # Map playlist_id to id for frontend compatibility
        playlist["id"] = playlist["playlist_id"]
    
    return {
        "status": "success", 
        "data": {
            "playlists": playlists
        }
    }

@router.get("/playlists/one/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist_detail(playlist_id: int):
    playlist_detail = await get_playlist_details(playlist_id)
    
    if not playlist_detail:
        raise HTTPException(status_code=404, detail="Playlist not found")
    
    return {
        "status": "success", 
        "data": playlist_detail
    }