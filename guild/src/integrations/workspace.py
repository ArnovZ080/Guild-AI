from typing import Iterable
from typing import Iterable
from guild.src.core.models.schemas import DataRoom, Document
from guild.src.core.storage import Connector

class WorkspaceConnector(Connector):
    provider: str = "workspace"

    def list_documents(self, data_room: DataRoom) -> Iterable[Document]:
        # TODO: Implement MinIO object listing for workspace/<user>/<room>/
        # For now, return an empty list
        return []

    def fetch_content(self, doc: Document) -> str:
        # TODO: Implement MinIO object download and Unstructured processing
        # For now, return empty string
        return ""


