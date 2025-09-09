import redis.asyncio as redis
import json

redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)

async def publish_event(channel: str, message: dict):
    await redis_client.publish(channel, json.dumps(message))
