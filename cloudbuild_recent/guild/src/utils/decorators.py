from functools import wraps
from typing import Callable, Any


def inject_knowledge(func: Callable[..., Any]) -> Callable[..., Any]:
    """No-op decorator placeholder that injects an optional knowledge kwarg if missing."""
    @wraps(func)
    async def wrapper(*args: Any, **kwargs: Any) -> Any:
        kwargs.setdefault("knowledge", None)
        return await func(*args, **kwargs)
    return wrapper
