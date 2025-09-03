from typing import Callable, Optional, Any

AgentCallback = Callable[[str, dict], None]

class Agent:
    def __init__(self, name: str, description: str, user_input: Any, callback: Optional[AgentCallback] = None):
        self.name = name
        self.description = description
        self.user_input = user_input
        self._callback = callback

    def _send_start_callback(self) -> None:
        if self._callback:
            self._callback("start", {"agent": self.name})

    def _send_end_callback(self, output: Any) -> None:
        if self._callback:
            self._callback("end", {"agent": self.name, "output": output})

    def _send_llm_start_callback(self, prompt: str, provider: str, model: str) -> None:
        if self._callback:
            self._callback("llm_start", {"prompt": prompt, "provider": provider, "model": model})

    def _send_llm_end_callback(self, response: str) -> None:
        if self._callback:
            self._callback("llm_end", {"response": response})
