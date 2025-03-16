import aiosqlite
from ..database import DATABASE
from .schemas import ProfileUpdateRequest
import asyncio

# Khởi tạo database cho profile nếu chưa có
async def setup_profile_database():
    async with aiosqlite.connect(DATABASE) as db:
        # Tạo bảng user_profiles nếu chưa có
        await db.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                user_id INTEGER PRIMARY KEY,
                bio TEXT,
                avatar_url TEXT,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Tạo bảng playlists
        await db.execute('''
            CREATE TABLE IF NOT EXISTS playlists (
                playlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
        ''')
        
        # Tạo bảng playlist_songs để lưu trữ các bài hát trong playlist
        await db.execute('''
            CREATE TABLE IF NOT EXISTS playlist_songs (
                playlist_id INTEGER,
                song_id INTEGER,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (playlist_id, song_id),
                FOREIGN KEY (playlist_id) REFERENCES playlists(playlist_id)
            )
        ''')
        
        await db.commit()

# Lấy thông tin profile
async def get_user_profile(user_id: int) -> dict:
    async with aiosqlite.connect(DATABASE) as db:
        # Lấy thông tin từ users table
        cursor = await db.execute(
            "SELECT username, fullname, email, dob FROM users WHERE user_id = ?", 
            (user_id,)
        )
        user = await cursor.fetchone()
        
        if not user:
            return None
            
        # Lấy thông tin từ user_profiles table
        cursor = await db.execute(
            "SELECT bio, avatar_url FROM user_profiles WHERE user_id = ?", 
            (user_id,)
        )
        profile = await cursor.fetchone()
        
        # Tạo profile mới nếu chưa có
        if not profile:
            await db.execute(
                "INSERT INTO user_profiles (user_id, bio, avatar_url) VALUES (?, ?, ?)",
                (user_id, "", "")
            )
            await db.commit()
            profile = ("", "")  # Default values
        
        return {
            "user_id": user_id,
            "username": user[0],
            "fullname": user[1],
            "email": user[2],
            "dob": user[3],
            "bio": profile[0],
            "avatar_url": profile[1]
        }

# Cập nhật thông tin profile
async def update_user_profile(user_id: int, profile_data: ProfileUpdateRequest) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        updates = []
        values = []
        
        # Cập nhật fullname trong users table
        if profile_data.fullname is not None:
            await db.execute(
                "UPDATE users SET fullname = ? WHERE user_id = ?",
                (profile_data.fullname, user_id)
            )
        
        # Cập nhật các trường khác trong user_profiles table
        if profile_data.bio is not None:
            updates.append("bio = ?")
            values.append(profile_data.bio)
            
        if profile_data.avatar_url is not None:
            updates.append("avatar_url = ?")
            values.append(profile_data.avatar_url)
            
        if updates:
            # Kiểm tra xem profile đã tồn tại chưa
            cursor = await db.execute("SELECT 1 FROM user_profiles WHERE user_id = ?", (user_id,))
            exists = await cursor.fetchone()
            
            if exists:
                # Cập nhật nếu đã tồn tại
                query = f"UPDATE user_profiles SET {', '.join(updates)} WHERE user_id = ?"
                values.append(user_id)
                await db.execute(query, values)
            else:
                # Tạo mới nếu chưa tồn tại
                await db.execute(
                    "INSERT INTO user_profiles (user_id, bio, avatar_url) VALUES (?, ?, ?)",
                    (user_id, profile_data.bio or "", profile_data.avatar_url or "")
                )
                
            await db.commit()
            return True
        
        return False

# Lấy danh sách playlist của người dùng
async def get_user_playlists(user_id: int) -> list:
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        cursor = await db.execute(
            "SELECT playlist_id, name, description, created_at FROM playlists WHERE user_id = ? ORDER BY created_at DESC",
            (user_id,)
        )
        playlists = await cursor.fetchall()
        
        result = []
        for playlist in playlists:
            # Đếm số lượng bài hát trong playlist
            count_cursor = await db.execute(
                "SELECT COUNT(*) FROM playlist_songs WHERE playlist_id = ?",
                (playlist['playlist_id'],)
            )
            song_count = await count_cursor.fetchone()
            
            result.append({
                "playlist_id": playlist['playlist_id'],
                "name": playlist['name'],
                "description": playlist['description'],
                "created_at": playlist['created_at'],
                "song_count": song_count[0]
            })
            
        return result

# Tạo playlist mới
async def create_playlist(user_id: int, name: str, description: str = None) -> int:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute(
            "INSERT INTO playlists (user_id, name, description) VALUES (?, ?, ?)",
            (user_id, name, description)
        )
        await db.commit()
        return cursor.lastrowid

# Thêm bài hát vào playlist
async def add_song_to_playlist(playlist_id: int, song_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        try:
            await db.execute(
                "INSERT INTO playlist_songs (playlist_id, song_id) VALUES (?, ?)",
                (playlist_id, song_id)
            )
            await db.commit()
            return True
        except:
            return False

# Xóa bài hát khỏi playlist
async def remove_song_from_playlist(playlist_id: int, song_id: int) -> bool:
    async with aiosqlite.connect(DATABASE) as db:
        await db.execute(
            "DELETE FROM playlist_songs WHERE playlist_id = ? AND song_id = ?",
            (playlist_id, song_id)
        )
        await db.commit()
        return True