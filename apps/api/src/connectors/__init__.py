
from .registry import register
from .workspace import WorkspaceConnector

try:
    from .google_drive import GoogleDriveConnector
    register("gdrive", GoogleDriveConnector())
except ImportError:
    print("Warning: Google Drive connector not available")

try:
    from .dropbox import DropboxConnector
    register("dropbox", DropboxConnector())
except ImportError:
    print("Warning: Dropbox connector not available")

register("workspace", WorkspaceConnector())

