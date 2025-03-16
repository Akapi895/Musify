import aiosqlite
from ..database import DATABASE
from .schemas import RegisterRequest

async def authenticate_user(username: str, password: str) -> str:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT user_id FROM users WHERE username = ? AND password = ?", (username, password))
        user = await cursor.fetchone()
        await cursor.close()
        if not user:
            return None
        return user[0]

async def register_user(signup: RegisterRequest) -> str:
    async with aiosqlite.connect(DATABASE) as db:
        cursor = await db.execute("SELECT user_id FROM users WHERE username = ?", (signup.username,))
        existing_user = await cursor.fetchone()
        if existing_user:
            await cursor.close()
            return None
        
        await db.execute(
            "INSERT INTO users (username, fullname, email, dob, password) VALUES (?, ?, ?, ?, ?)",
            (signup.username, signup.fullname, signup.email, signup.dob, signup.password)
        )
        await db.commit()
        
        cursor = await db.execute("SELECT user_id FROM users WHERE username = ?", (signup.username,))
        new_user = await cursor.fetchone()
        await cursor.close()
        return new_user[0]