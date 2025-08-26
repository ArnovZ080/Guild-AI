import json
from guild.src.core import llm_client
from . import research_agent
from typing import Dict, Any, List

def perform_keyword_research(topic: str) -> Dict[str, List[str]]:
    """
    Uses an LLM to generate a list of related keywords for a given topic.
    """
    print(f"SEO Agent: Performing keyword research for topic: '{topic}'")

    prompt = f"""
    You are a world-class SEO expert with deep knowledge of keyword research, equivalent to tools like Ahrefs and SEMrush.

    The user's primary topic is: "{topic}"

    Generate a comprehensive list of related keywords. The list should be a JSON object with the following keys:
    - "primary_keyword": The most important keyword.
    - "long_tail_keywords": A list of at least 10 long-tail variations.
    - "lsi_keywords": A list of at least 10 Latent Semantic Indexing (LSI) or related topical keywords.
    - "user_intent_questions": A list of 5 common questions users ask related to this topic.

    Return ONLY the JSON object.
    """

    try:
        keywords = llm_client.generate_json(prompt=prompt)
        print("SEO Agent: Successfully generated keyword list.")
        return keywords
    except Exception as e:
        print(f"SEO Agent: Failed to perform keyword research. Error: {e}")
        raise

def analyze_competitors(topic: str, num_competitors: int = 3) -> List[Dict[str, Any]]:
    """
    Analyzes the top search competitors for a given topic by scraping their content
    and using an LLM to summarize their structure.
    """
    print(f"SEO Agent: Analyzing top {num_competitors} competitors for '{topic}'...")

    # First, find the top competitors
    search_results = research_agent.search_web(query=f"top articles about {topic}")

    # This is a simplification. A real implementation would parse the search results
    # to get a list of distinct URLs. For now, we'll assume the initial search
    # gives us one good competitor and we'll analyze it.

    competitor_url = search_results.get("url")
    if not competitor_url:
        print("SEO Agent: Could not find any competitors to analyze.")
        return []

    competitors = []
    # In a real loop, you would iterate through the top N URLs.
    # for url in top_n_urls:

    print(f"  > Analyzing competitor: {competitor_url}")
    # Scrape the content of the competitor's page
    page_content = research_agent.search_web(query=competitor_url) # Re-using search_web to scrape a direct URL

    if not page_content or not page_content.get("content"):
        print(f"  > Failed to scrape content from {competitor_url}")
        return []

    # Use an LLM to analyze the content structure
    prompt = f"""
    You are an SEO analyst. Analyze the following article content and provide a structured summary of its on-page SEO.

    Article Content (first 4000 characters):
    ---
    {page_content['content'][:4000]}
    ---

    Provide your analysis as a JSON object with the following keys:
    - "main_title": The main title or H1 of the article.
    - "main_headings": A list of the main H2 headings used in the article.
    - "key_themes": A brief summary of the key themes or topics covered.
    - "content_gap_opportunity": Suggest one topic or angle that this article missed, which could be a content gap to exploit.

    Return ONLY the JSON object.
    """

    try:
        analysis = llm_client.generate_json(prompt)
        analysis['url'] = competitor_url
        competitors.append(analysis)
        print(f"  > Successfully analyzed competitor.")
    except Exception as e:
        print(f"  > Failed to analyze competitor with LLM. Error: {e}")

    return competitors

def analyze_seo_opportunity(topic: str) -> Dict[str, Any]:
    """
    The main analysis function for the SEO Agent.
    It performs keyword research and competitor analysis.
    """
    print(f"--- SEO AGENT: Starting analysis for topic: '{topic}' ---")

    # Step 1: Keyword Research
    keyword_data = perform_keyword_research(topic)

    # Step 2: Competitor Analysis (stubbed for now)
    competitor_analysis = analyze_competitors(topic)

    analysis_summary = {
        "keyword_research": keyword_data,
        "competitor_analysis": competitor_analysis
    }

    print(f"--- SEO AGENT: Finished analysis for topic: '{topic}' ---")

    # Step 3: Generate Recommendations
    recommendations = generate_seo_recommendations(topic, analysis_summary)

    return recommendations

def generate_seo_recommendations(topic: str, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Takes SEO analysis data and generates actionable recommendations using an LLM.
    """
    print("SEO Agent: Generating final recommendations...")

    prompt = f"""
    You are a world-class SEO strategist, acting as a consultant for a client. You have already performed the initial research. Now, you must deliver a comprehensive and actionable SEO plan.

    Primary Topic: "{topic}"

    Your Research Data:
    ---
    {json.dumps(analysis_data, indent=2)}
    ---

    Based on this data, generate a final SEO strategy as a JSON object. The JSON object must include the following keys:
    - "recommended_title": A compelling, SEO-optimized title for a new piece of content on this topic.
    - "on_page_seo": {{
        "meta_description": "A 155-character meta description.",
        "headings_structure": ["An H1 heading", "An H2 subheading", "Another H2 subheading"],
        "internal_linking_suggestions": ["Suggest 2-3 internal pages to link to."]
      }},
    - "content_brief": "A detailed, paragraph-by-paragraph brief for a writer to create the content.",
    - "off_page_seo_strategy": "Suggest 3-5 specific backlink or promotional opportunities (e.g., 'Submit to X aggregator', 'Pitch a guest post to Y blog')."

    Return ONLY the JSON object.
    """

    try:
        recommendations = llm_client.generate_json(prompt)
        print("SEO Agent: Successfully generated SEO recommendations.")
        return recommendations
    except Exception as e:
        print(f"SEO Agent: Failed to generate recommendations. Error: {e}")
        raise
