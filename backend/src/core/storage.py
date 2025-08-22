from typing import Protocol, Iterable, Optional
from .schemas import DataRoom, DocumentMeta

class Connector(Protocol):
    provider: str
    def list_documents(self, data_room: DataRoom) -> Iterable[DocumentMeta]: ...
    def fetch_content(self, doc: DocumentMeta) -> str: ...  # returns plain text


