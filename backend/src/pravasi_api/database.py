import certifi
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from .config import DB_NAME, MONGO_URL

client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URL, tlsCAFile=certifi.where())
db: AsyncIOMotorDatabase = client[DB_NAME]
