
from .registry import register
from .workspace import WorkspaceConnector

register("workspace", WorkspaceConnector())

