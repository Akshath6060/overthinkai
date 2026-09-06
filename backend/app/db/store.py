import asyncio
import copy
import re
from collections import defaultdict
from typing import Any

from pymongo import AsyncMongoClient, ReturnDocument


class MongoStore:
    def __init__(self, uri: str, database: str):
        self.client = AsyncMongoClient(uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[database]

    async def ping(self):
        await self.client.admin.command("ping")

    async def close(self):
        await self.client.close()

    async def insert(self, collection: str, doc: dict):
        await self.db[collection].insert_one(copy.deepcopy(doc))
        return doc

    async def find_one(self, collection: str, query: dict):
        return await self.db[collection].find_one(query)

    async def find_many(self, collection: str, query: dict, sort=None, limit=0):
        cursor = self.db[collection].find(query)
        if sort:
            cursor = cursor.sort(sort)
        if limit:
            cursor = cursor.limit(limit)
        return await cursor.to_list(length=limit or None)

    async def update_one(self, collection: str, query: dict, update: dict, upsert=False):
        return await self.db[collection].update_one(query, update, upsert=upsert)

    async def find_one_and_update(self, collection: str, query: dict, update: dict, upsert=False):
        return await self.db[collection].find_one_and_update(query, update, upsert=upsert, return_document=ReturnDocument.AFTER)

    async def delete_many(self, collection: str, query: dict):
        return await self.db[collection].delete_many(query)

    async def delete_one(self, collection: str, query: dict):
        return await self.db[collection].delete_one(query)

    async def count(self, collection: str, query: dict):
        return await self.db[collection].count_documents(query)


class Result:
    def __init__(self, matched=0, modified=0, deleted=0):
        self.matched_count = matched
        self.modified_count = modified
        self.deleted_count = deleted


class MemoryStore:
    """Deterministic async store used only when explicitly selected."""
    def __init__(self):
        self.data: dict[str, list[dict]] = defaultdict(list)
        self.lock = asyncio.Lock()

    async def ping(self):
        return True

    async def close(self):
        return None

    def _match(self, doc: dict, query: dict) -> bool:
        for key, expected in query.items():
            actual = doc.get(key)
            if isinstance(expected, dict):
                for op, value in expected.items():
                    if op == "$in" and actual not in value: return False
                    if op == "$nin" and actual in value: return False
                    if op == "$ne" and actual == value: return False
                    if op == "$gt" and not (actual is not None and actual > value): return False
                    if op == "$gte" and not (actual is not None and actual >= value): return False
                    if op == "$lt" and not (actual is not None and actual < value): return False
                    if op == "$lte" and not (actual is not None and actual <= value): return False
                    if op == "$regex" and not re.search(value, str(actual or ""), re.I if expected.get("$options") == "i" else 0): return False
                    if op == "$options": continue
            elif actual != expected:
                return False
        return True

    async def insert(self, collection: str, doc: dict):
        async with self.lock:
            if any(d.get("_id") == doc.get("_id") for d in self.data[collection]):
                raise ValueError("duplicate key")
            self.data[collection].append(copy.deepcopy(doc))
        return doc

    async def find_one(self, collection: str, query: dict):
        async with self.lock:
            item = next((d for d in self.data[collection] if self._match(d, query)), None)
            return copy.deepcopy(item)

    async def find_many(self, collection: str, query: dict, sort=None, limit=0):
        async with self.lock:
            items = [copy.deepcopy(d) for d in self.data[collection] if self._match(d, query)]
        for key, direction in reversed(sort or []):
            items.sort(key=lambda d: d.get(key), reverse=direction < 0)
        return items[:limit] if limit else items

    def _apply(self, doc: dict, update: dict):
        if "$set" in update: doc.update(copy.deepcopy(update["$set"]))
        if "$inc" in update:
            for key, value in update["$inc"].items(): doc[key] = doc.get(key, 0) + value
        if "$setOnInsert" in update:
            for key, value in update["$setOnInsert"].items(): doc.setdefault(key, copy.deepcopy(value))

    async def update_one(self, collection: str, query: dict, update: dict, upsert=False):
        async with self.lock:
            for doc in self.data[collection]:
                if self._match(doc, query):
                    self._apply(doc, update)
                    return Result(1, 1)
            if upsert:
                doc = {k: v for k, v in query.items() if not isinstance(v, dict)}
                self._apply(doc, update)
                self.data[collection].append(doc)
                return Result(0, 1)
        return Result()

    async def find_one_and_update(self, collection: str, query: dict, update: dict, upsert=False):
        async with self.lock:
            for doc in self.data[collection]:
                if self._match(doc, query):
                    self._apply(doc, update)
                    return copy.deepcopy(doc)
            if upsert:
                doc = {k: v for k, v in query.items() if not isinstance(v, dict)}
                self._apply(doc, update)
                self.data[collection].append(doc)
                return copy.deepcopy(doc)
        return None

    async def delete_many(self, collection: str, query: dict):
        async with self.lock:
            before = len(self.data[collection])
            self.data[collection] = [d for d in self.data[collection] if not self._match(d, query)]
            return Result(deleted=before-len(self.data[collection]))

    async def delete_one(self, collection: str, query: dict):
        async with self.lock:
            for i, doc in enumerate(self.data[collection]):
                if self._match(doc, query):
                    self.data[collection].pop(i)
                    return Result(deleted=1)
        return Result()

    async def count(self, collection: str, query: dict):
        return len(await self.find_many(collection, query))

