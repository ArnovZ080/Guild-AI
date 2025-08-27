REGISTRY = {}  # {"gdrive": GDriveConnector(...), "notion": NotionConnector(...), ...}

def register(name, connector):
    REGISTRY[name] = connector

def get_connector(name):
    return REGISTRY[name]


