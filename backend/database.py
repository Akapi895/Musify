import aiosqlite
import os

DATABASE = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'musify.db')
# print(DATABASE)