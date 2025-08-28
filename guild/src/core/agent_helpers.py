from functools import wraps
from guild.src.agents import research_agent

def inject_knowledge(agent_function):
    """
    A decorator that injects real-time knowledge into an agent's prompt.

    It performs a web search based on the core task in the prompt and
    prepends the findings to the original prompt.
    """
    @wraps(agent_function)
    def wrapper(*args, **kwargs):
        # The prompt is expected to be a keyword argument to the decorated function.
        prompt = kwargs.get("prompt")
        if not prompt:
            # If there's no prompt, we can't do much.
            return agent_function(*args, **kwargs)

        # Heuristic to find a good search query from the prompt.
        # This is a simplification; a better approach might be to use an LLM
        # to extract key topics from the prompt.
        try:
            # Look for a line like "Client's Objective: '...'"
            query_line = next(line for line in prompt.split('\n') if "objective" in line.lower())
            search_query = query_line.split(':')[1].strip().replace('"', '')
        except StopIteration:
            # Fallback to using the first non-empty line of the prompt
            search_query = next((line for line in prompt.split('\n') if line.strip()), "general context")

        print(f"  [Knowledge Injector]: Performing web search for query: '{search_query}'...")
        research_results = research_agent.search_web(query=search_query)

        knowledge_context = "No relevant context found."
        if research_results and research_results.get("content"):
            knowledge_context = research_results["content"]
            print(f"  [Knowledge Injector]: Found context from {research_results.get('url')}")

        # Prepend the fetched context to the original prompt
        injected_prompt = f"""
Here is some up-to-date context from a web search. Use this information to inform your response and ensure your output is current and based on real-world data.

--- WEB CONTEXT START ---
{knowledge_context}
--- WEB CONTEXT END ---

Now, proceed with your original task based on the prompt below.

--- ORIGINAL PROMPT START ---
{prompt}
--- ORIGINAL PROMPT END ---
"""

        # Replace the original prompt with the new, injected prompt
        kwargs["prompt"] = injected_prompt

        return agent_function(*args, **kwargs)

    return wrapper
