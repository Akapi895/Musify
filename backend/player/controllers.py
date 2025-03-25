from fastapi import APIRouter, HTTPException, Depends, Query, File, UploadFile, Form
from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime
import uuid
import os
import shutil
from pathlib import Path
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
class CreateSongResponse(BaseModel):
    status: str
    data: dict

@router.post("/create", response_model=CreateSongResponse)
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

    
@router.post("/upload-temp-file/", response_model=dict)
async def upload_temp_file(file: UploadFile = File(...)):
    """Upload a song file temporarily and return a session ID"""
    try:
        # Determine the absolute path of this file
        current_file_path = Path(__file__).resolve()
        
        # Navigate to project root (from backend/player/controllers.py to project root)
        project_root = current_file_path.parent.parent.parent
        
        # Create path to frontend assets
        temp_dir = project_root / "frontend" / "src" / "assets" / "temp"
        temp_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Temp directory path: {temp_dir}")
        print(f"Temp directory exists: {temp_dir.exists()}")
        
        # Generate a unique session ID for this file
        session_id = str(uuid.uuid4())
        
        # Extract file extension (with fallback)
        file_ext = os.path.splitext(file.filename)[1]
        if not file_ext:
            file_ext = ".mp3"  # Default extension if none provided
        
        # Create a temp filename with the session ID
        temp_filename = f"{session_id}{file_ext}"
        temp_path = temp_dir / temp_filename
        
        # Save the file to temp location
        print(f"Saving file to {temp_path}")
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Check if file was saved successfully
        if temp_path.exists():
            file_size = temp_path.stat().st_size
            print(f"File saved successfully. Size: {file_size} bytes")
        else:
            print(f"WARNING: File not saved to {temp_path}")
        
        # For frontend access, we need a relative path
        relative_path = f"../../assets/temp/{temp_filename}"
        
        return {
            "status": "success", 
            "data": {
                "session_id": session_id,
                "original_filename": file.filename,
                "temp_path": relative_path
            }
        }
    except Exception as e:
        error_msg = f"File upload failed: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

class CommitFileRequest(BaseModel):
    session_id: str
    original_filename: str

@router.post("/commit-file/", response_model=dict)
async def commit_uploaded_file(request: CommitFileRequest):
    """Move a temporarily uploaded file to the permanent location"""
    try:
        # Determine the absolute path of this file
        current_file_path = Path(__file__).resolve()
        
        # Navigate to project root (from backend/player/controllers.py to project root)
        project_root = current_file_path.parent.parent.parent
        
        # Create paths to frontend assets
        temp_dir = project_root / "frontend" / "src" / "assets" / "temp"
        songs_dir = project_root / "frontend" / "public" / "assets" / "songs"
        
        # Ensure songs directory exists
        songs_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"Looking for temp file with session ID: {request.session_id}")
        print(f"Temp directory: {temp_dir}")
        
        # List all files in temp directory for debugging
        print("Files in temp directory:")
        for file_path in temp_dir.iterdir():
            print(f" - {file_path.name}")
        
        # Find the temp file with the session ID
        temp_files = list(temp_dir.glob(f"{request.session_id}.*"))
        
        if not temp_files or len(temp_files) == 0:
            raise HTTPException(status_code=404, detail=f"Temporary file not found for session ID: {request.session_id}")
        
        # Use the first matching file (there should only be one)
        temp_file = temp_files[0]
        print(f"Found temp file: {temp_file}")
        
        # Get file extension from the temp file
        file_ext = temp_file.suffix
        if not file_ext:
            file_ext = os.path.splitext(request.original_filename)[1]
            if not file_ext:
                file_ext = ".mp3"  # Default extension
        
        # Extract base name from original filename and normalize it
        original_name = os.path.splitext(request.original_filename)[0]
        
        # Step 1: Remove accents/diacritics (for Vietnamese and other languages)
        import unicodedata
        normalized_name = unicodedata.normalize('NFKD', original_name)
        normalized_name = ''.join([c for c in normalized_name if not unicodedata.combining(c)])
        
        # Step 2: Convert to lowercase and remove special characters
        safe_name = "".join(c.lower() for c in normalized_name if c.isalnum() or c in "._- ")
        
        # Step 3: Replace spaces with underscores
        safe_name = safe_name.replace(" ", "_")
        
        # Step 4: Replace multiple underscores with a single one
        while "__" in safe_name:
            safe_name = safe_name.replace("__", "_")
        
        # Step 5: Remove leading/trailing underscores
        safe_name = safe_name.strip("_")
        
        # Step 6: Add timestamp to ensure uniqueness
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        permanent_filename = f"{safe_name}_{timestamp}{file_ext}"
        
        # Create full path for the permanent file
        permanent_path = songs_dir / permanent_filename
        
        print(f"Moving file from {temp_file} to {permanent_path}")
        
        # Move the file from temp to permanent location
        shutil.move(str(temp_file), str(permanent_path))
        
        # Check if the file was moved successfully
        if not permanent_path.exists():
            raise HTTPException(status_code=500, detail="Failed to move file to permanent location")
        
        print(f"File successfully moved. Size: {permanent_path.stat().st_size} bytes")
        
        # Return the relative path for the frontend
        relative_path = f"../../assets/songs/{permanent_filename}"
        
        return {
            "status": "success",
            "data": {
                "file_url": relative_path
            }
        }
    except Exception as e:
        error_msg = f"Failed to commit file: {str(e)}"
        print(f"ERROR: {error_msg}")
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=error_msg)
    
class DeleteTempFileRequest(BaseModel):
    session_id: str
@router.post("/delete-temp-file/", response_model=dict)
async def delete_temp_file(request: DeleteTempFileRequest):
    """Delete a temporary file"""
    try:
        # Determine the absolute path of this file
        current_file_path = Path(__file__).resolve()
        
        # Navigate to project root (from backend/player/controllers.py to project root)
        project_root = current_file_path.parent.parent.parent
        
        # Create path to temp directory
        temp_dir = project_root / "frontend" / "src" / "assets" / "temp"
        
        # Find the temp file with the session ID
        temp_files = list(temp_dir.glob(f"{request.session_id}.*"))
        
        if not temp_files:
            # Not finding the file is not an error - it might have been cleaned up already
            return {"status": "success", "message": "No file found to delete"}
        
        # Delete all matching files (should typically be just one)
        for temp_file in temp_files:
            print(f"Removing temporary file: {temp_file}")
            os.remove(temp_file)
        
        return {
            "status": "success",
            "message": f"Temporary file(s) deleted: {len(temp_files)}"
        }
    except Exception as e:
        error_msg = f"Failed to delete temporary file: {str(e)}"
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)