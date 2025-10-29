from typing import Protocol, Iterable, Optional
from guild.src.core.models.schemas import DataRoom, Document

class Connector(Protocol):
    provider: str
    def list_documents(self, data_room: DataRoom) -> Iterable[Document]: ...
    def fetch_content(self, doc: Document) -> str: ...  # returns plain text


