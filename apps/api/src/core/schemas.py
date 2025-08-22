from pydantic import BaseModel, Field
from typing import Optional, Literal, Dict, List
from datetime import datetime

Provider = Literal["workspace","gdrive","notion","onedrive","dropbox"]

class DataRoom(BaseModel):
    id: str
    name: str
    provider: Provider
    config: Dict[str, str] = {}     # e.g. folder_id, db_id, site_id
    read_only: bool = True
    last_sync_at: Optional[datetime] = None

class ConnectorCredential(BaseModel):
    provider: Provider
    account_id: str                 # user’s provider account
    access_token: str               # encrypted at rest
    refresh_token: Optional[str] = None
    expires_at: Optional[datetime] = None
    scopes: List[str] = []

class DocumentMeta(BaseModel):
    source_id: str                  # provider\'s doc id
    data_room_id: str
    provider: Provider
    path: str                       # human readable
    mime: Optional[str] = None
    updated_at: datetime
    hash: str                       # content hash to detect changes
    status: Literal["indexed","stale","error"] = "stale"

class SourceProvenance(BaseModel):
    provider: Provider
    data_room_id: str
    source_id: str
    path: str
    chunk_ids: List[str] = []
    confidence: float

class SEOChecklistV1(BaseModel):
    title: str
    slug: str
    meta_description: Optional[str] = None
    keywords: List[str]
    readability_notes: Optional[List[str]] = None
    internal_links: Optional[List[str]] = None


