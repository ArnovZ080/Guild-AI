from typing import Iterable
from ..core.schemas import DataRoom, DocumentMeta
from ..core.storage import Connector

class WorkspaceConnector(Connector):
    provider: str = "workspace"

    def list_documents(self, data_room: DataRoom) -> Iterable[DocumentMeta]:
        # TODO: Implement MinIO object listing for workspace/<user>/<room>/
        # For now, return an empty list
        return []

    def fetch_content(self, doc: DocumentMeta) -> str:
        # TODO: Implement MinIO object download and Unstructured processing
        # For now, return empty string
        return ""


