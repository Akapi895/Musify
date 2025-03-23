import aiosqlite
from ..database import DATABASE
from .schemas import ProfileUpdateRequest
import asyncio

async def get_user_profile(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "SELECT username, fullname, email, dob, avatar_url FROM users WHERE user_id = ?", 
            (user_id,)
        )
        user = await cursor.fetchone()
        
        if not user:
            return None

        profile = await cursor.fetchone()
                
        return {
            "user_id": user_id,
            "username": user[0],
            "fullname": user[1],
            "email": user[2],
            "dob": user[3],
            "avatar_url": user[4]
        }

# chưa dùng vội
async def update_user_profile(user_id: int, profile_data: ProfileUpdateRequest) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        updates = []
        values = []
        
        if profile_data.fullname is not None:
            updates.append("fullname = ?")
            values.append(profile_data.fullname)
                    
        if profile_data.avatar_url is not None:
            updates.append("avatar_url = ?")
            values.append(profile_data.avatar_url)

        if profile_data.password is not None:
            updates.append("password = ?")
            values.append(profile_data.password)
        
        if updates:
            query = f"UPDATE users SET {', '.join(updates)} WHERE user_id = ?"
            values.append(user_id)
            await db.execute(query, values)
            await db.commit()
        
        return await get_user_profile(user_id)
    
async def get_user_playlists(user_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT playlist_id, name, description "
            "FROM playlists WHERE user_id = ?",
            (user_id,)
        )
        playlists = await cursor.fetchall()
        
        result = []
        for playlist in playlists:
            count_cursor = await db.execute(
                "SELECT COUNT(*) FROM connections WHERE playlist_id = ?",
                (playlist['playlist_id'],)
            )
            song_count = await count_cursor.fetchone()
            
            result.append({
                "playlist_id": playlist['playlist_id'],
                "name": playlist['name'],
                "description": playlist['description'],
                "song_count": song_count[0]
            })
            
        return result

async def create_playlist(user_id: int, name: str, description: str = None) -> int:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)",
            (user_id, name, description)
        )
        await db.commit()
        return cursor.lastrowid

async def add_song_to_playlist(playlist_id: int, player_id: int, user_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            cursor = await db.execute(
                "SELECT user_id FROM playlists WHERE playlist_id = ?",
                (playlist_id,)
            )
            owner_id = await cursor.fetchall()

            if not owner_id or (owner_id[0][0] != user_id):
                return False

            await db.execute(
                "INSERT INTO connections (playlist_id, player_id) VALUES (?, ?)",
                (playlist_id, player_id)
            )
            await db.commit()
            return True
        except:
            return False

async def remove_song_from_playlist(playlist_id: int, player_id: int, user_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            cursor = await db.execute(
                "SELECT user_id FROM playlists WHERE playlist_id = ?",
                (playlist_id,)
            )
            owner_id = await cursor.fetchall()
            
            if not owner_id or (owner_id[0][0] != user_id):
                return False
                
            await db.execute(
                "DELETE FROM connections WHERE playlist_id = ? AND player_id = ?",
                (playlist_id, player_id)
            )
            await db.commit()
            return True
        except Exception as e:
            print(f"Error removing song from playlist: {e}")
            return False