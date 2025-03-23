import datetime
import random
import aiosqlite
from ..database import DATABASE
from typing import List, Dict, Any, Optional

# Number of days for new releases
NEW_RELEASE_DAYS = 30

async def get_featured_songs(limit: int = 10) -> List[Dict[str, Any]]:
    """Gets featured songs for homepage display.
    Currently selects popular songs or manually curated ones."""
    
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        
        # In a real app, you might have a 'featured' flag or table
        # For now, we'll just get some popular songs or recently added ones
        cursor = await db.execute(
            """SELECT p.player_id, p.title, p.artist, p.duration, 
                    p.release_date, p.file_url, p.cover_url, p.lyrics
            FROM songs p
            ORDER BY RANDOM()
            LIMIT ?""",
            (limit,)
        )
        
        songs = await cursor.fetchall()
        
        # Convert to dictionaries
        return [dict(song) for song in songs]

async def get_new_releases(days: int = NEW_RELEASE_DAYS, limit: int = 10) -> List[Dict[str, Any]]:   
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        
        cursor = await db.execute(
            """SELECT p.player_id, p.title, p.artist, p.duration, 
                    p.release_date, p.file_url, p.lyrics
            FROM songs p
            ORDER BY p.release_date DESC
            LIMIT ?""",
            (limit,)
        )
        
        songs = await cursor.fetchall()
        
        # If we don't have enough new songs, get the most recent ones regardless of cutoff
        if len(songs) < limit:
            cursor = await db.execute(
                """SELECT p.player_id, p.title, p.artist, p.duration, 
                        p.release_date, p.file_url, p.lyrics
                FROM songs p
                ORDER BY p.release_date DESC
                LIMIT ?""",
                (limit,)
            )
            songs = await cursor.fetchall()
        
        # Convert to dictionaries
        return [dict(song) for song in songs]

async def get_top_favorites(limit: int = 5) -> List[Dict[str, Any]]:
    """Gets top favorite songs either personalized for a user or global."""
    
    async with aiosqlite.connect(DATABASE) as db:
        db.row_factory = aiosqlite.Row
        
        cursor = await db.execute(
            """
            SELECT p.player_id, p.title, p.artist, p.duration, 
                    p.release_date, p.file_url, p.lyrics
            FROM songs p
            WHERE p.player_id IN (
                SELECT player_id
                FROM favors
                GROUP BY player_id
                ORDER BY COUNT(*) DESC
            )
            LIMIT ?
            """,
            (limit,)
        )
        
        songs = await cursor.fetchall()
        
        # If no favorites found, return random songs
        if not songs:
            return await get_featured_songs(limit)
        
        # Convert to dictionaries
        return [dict(song) for song in songs]