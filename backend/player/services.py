import aiosqlite
from ..database import DATABASE
from ..auth.controllers import get_session_user_id
import asyncio

async def get_song_by_id(player_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM songs WHERE player_id = ?",
            (player_id,)
        )
        song = await cursor.fetchone()
                
        if not song:
            return None
            
        return dict(song)

async def add_song(
    title: str,
    artist: str,
    duration: int,
    file_url: str,
    release_date: str = None,
    lyrics: str = None,
    user_id: int = None
) -> int:
    if user_id is None:
        raise ValueError("user_id is required to add a song")
    
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            """
            INSERT INTO songs (title, artist, duration, release_date, file_url, lyrics, user_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (title, artist, duration, release_date, file_url, lyrics, user_id)
        )
        await db.commit()
        return cursor.lastrowid

async def update_song(
    player_id: int,
    title: str = None,
    artist: str = None,
    release_date: str = None,
    file_url: str = None,
    lyrics: str = None,
) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        userId = await get_session_user_id()
        
        # Set row_factory to return dictionaries
        db.row_factory = aiosqlite.Row
        
        cursor = await db.execute(
            "SELECT * FROM songs WHERE player_id = ?",
            (player_id,)
        )
        song = await cursor.fetchone()
        
        if not song:
            return False
        
        if song["user_id"] != userId:
            return False
        
        updates = []
        values = []
        
        if title is not None:
            updates.append("title = ?")
            values.append(title)
            
        if artist is not None:
            updates.append("artist = ?")
            values.append(artist)
                        
        if release_date is not None:
            updates.append("release_date = ?")
            values.append(release_date)
            
        if file_url is not None:
            updates.append("file_url = ?")
            values.append(file_url)
            
        if lyrics is not None:
            updates.append("lyrics = ?")
            values.append(lyrics)
        
        if not updates:
            return True 
        
        query = f"UPDATE songs SET {', '.join(updates)} WHERE player_id = ?"
        values.append(player_id)
        
        await db.execute(query, values)
        await db.commit()
        return True

async def delete_song(player_id: int, user_id: int = None) -> bool:
    """Xóa bài hát"""
    async with aiosqlite.connect(DATABASE) as db:
        # Nếu user_id được cung cấp, kiểm tra quyền sở hữu
        if user_id:
            cursor = await db.execute(
                "SELECT user_id FROM songs WHERE player_id = ?",
                (player_id,)
            )
            song = await cursor.fetchone()
            
            if not song or song[0] != user_id:
                return False
        
        await db.execute(
            "DELETE FROM songs WHERE player_id = ?",
            (player_id,)
        )
        await db.commit()
        return True
        
async def get_songs_by_user(user_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT * FROM songs WHERE user_id = ? ORDER BY release_date DESC",
            (user_id,)
        )
        songs = await cursor.fetchall()
        
        return [dict(song) for song in songs]
    
### Favors
async def add_favorite(user_id: int, player_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            cursor = await db.execute(
                "SELECT 1 FROM songs WHERE player_id = ?",
                (player_id,)
            )
            song_exists = await cursor.fetchone()
            
            if not song_exists:
                return False
                
            await db.execute(
                "INSERT OR REPLACE INTO favors (user_id, player_id) VALUES (?, ?)",
                (user_id, player_id)
            )
            await db.commit()
            return True
        except Exception as e:
            print(f"Error adding favorite: {e}")
            return False

async def remove_favorite(user_id: int, player_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            await db.execute(
                "DELETE FROM favors WHERE user_id = ? AND player_id = ?",
                (user_id, player_id)
            )
            await db.commit()
            return True
        except Exception as e:
            print(f"Error removing favorite: {e}")
            return False

async def get_favorites(user_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT s.* 
            FROM songs s
            JOIN favors f ON s.player_id = f.player_id 
            WHERE f.user_id = ?
            ORDER BY f.favor_id DESC
        ''', (user_id,))
        songs = await cursor.fetchall()
        
        return [dict(song) for song in songs]

async def is_favorite(user_id: int, player_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "SELECT 1 FROM favors WHERE user_id = ? AND player_id = ?",
            (user_id, player_id)
        )
        result = await cursor.fetchone()
        return result is not None
    
### Playlists
async def add_song_to_playlist(playlist_id: int, player_id: int, user_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            cursor = await db.execute(
                "SELECT user_id FROM playlists WHERE playlist_id = ?",
                (playlist_id,)
            )
            playlist = await cursor.fetchone()
            
            if not playlist or playlist[0] != user_id:
                return False
            
            cursor = await db.execute(
                "SELECT 1 FROM songs WHERE player_id = ?",
                (player_id,)
            )
            song_exists = await cursor.fetchone()
            
            if not song_exists:
                return False
            
            # Check song already in the playlist
            cursor = await db.execute(
                "SELECT 1 FROM connections WHERE playlist_id = ? AND player_id = ?",
                (playlist_id, player_id)
            )
            already_exists = await cursor.fetchone()
            
            if already_exists:
                return True
                
            await db.execute(
                "INSERT INTO connections (playlist_id, player_id) VALUES (?, ?)",
                (playlist_id, player_id)
            )
            await db.commit()
            return True
        except Exception as e:
            print(f"Error adding song to playlist: {e}")
            return False
        
async def create_user_playlist(name: str, description: str, user_id: int) -> int:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "INSERT INTO playlists (name, description, user_id) VALUES (?, ?, ?)",
            (name, description, user_id)
        )
        await db.commit()
        return cursor.lastrowid
    
async def remove_song_from_playlist(playlist_id: int, player_id: int, user_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            # Kiểm tra quyền sở hữu playlist
            cursor = await db.execute(
                "SELECT user_id FROM playlists WHERE playlist_id = ?",
                (playlist_id,)
            )
            playlist = await cursor.fetchone()
            
            if not playlist or playlist[0] != user_id:
                return False
            
            # Xóa bài hát khỏi playlist
            await db.execute(
                "DELETE FROM connections WHERE playlist_id = ? AND player_id = ?",
                (playlist_id, player_id)
            )
            await db.commit()
            return True
        except Exception as e:
            print(f"Error removing song from playlist: {e}")
            return False

async def get_playlist_songs(playlist_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute('''
            SELECT s.* 
            FROM songs s
            JOIN connections c ON s.player_id = c.player_id 
            WHERE c.playlist_id = ?
            ORDER BY c.connect_id DESC
        ''', (playlist_id,))
        songs = await cursor.fetchall()
        
        return [dict(song) for song in songs]

async def is_song_in_playlist(playlist_id: int, player_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "SELECT 1 FROM connections WHERE playlist_id = ? AND player_id = ?",
            (playlist_id, player_id)
        )
        result = await cursor.fetchone()
        return result is not None
    
async def get_playlists_all() -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM playlists")
        playlists = await cursor.fetchall()
        
        return [dict(playlist) for playlist in playlists]
    
async def get_playlist_details(playlist_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        
        # Get basic playlist info
        cursor = await db.execute(
            """SELECT name, description, user_id 
               FROM playlists
               WHERE playlist_id = ?""",
            (playlist_id,)
        )
        
        playlist = await cursor.fetchone()
        if not playlist:
            return None
            
        # Convert to dictionary
        playlist_dict = dict(playlist)
        
        # Get songs count
        songs = await get_playlist_songs(playlist_id)
        playlist_dict["song_count"] = len(songs)
        print(playlist_dict)
        
        return playlist_dict
    
async def get_songs_by_all() -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute("SELECT * FROM songs WHERE user_id > 0 ORDER BY release_date DESC")
        songs = await cursor.fetchall()
        
        return [dict(song) for song in songs]