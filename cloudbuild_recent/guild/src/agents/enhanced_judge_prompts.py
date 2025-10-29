"""
Enhanced Judge Agent Evaluation Prompts
Sophisticated multi-dimensional evaluation prompts for each evaluator type.
"""

from typing import Dict, Any
import json


class EnhancedEvaluatorPrompts:
    """Enhanced prompts for each evaluation dimension"""
    
    @staticmethod
    def get_fact_checker_prompt(deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """
        Sophisticated fact-checking evaluation prompt.
        Validates factual accuracy, data verification, and source credibility.
        """
        return f"""
# Fact Checker Agent - Factual Accuracy Evaluation

## Your Role
You are an expert fact-checking analyst specialized in verifying claims, statistics, and factual accuracy.
Your mission is to ensure every factual statement is accurate, verifiable, and properly sourced.

## Deliverable to Evaluate
{json.dumps(deliverable_data, indent=2)}

## Task Context
**Task Type:** {rubric.task_type}
**Objectives:** {json.dumps(rubric.objectives, indent=2)}

## Fact-Checking Framework

### 1. Factual Claims Analysis
- Identify ALL factual claims, statistics, dates, and data points
- Verify each claim against reliable sources
- Flag any unverified or unverifiable claims
- Check for internal consistency

### 2. Data Verification
- **Statistics:** Are numbers accurate and current?
- **Dates:** Are timeline references correct?
- **Attributions:** Are quotes and citations accurate?
- **Sources:** Are sources credible and properly cited?

### 3. Red Flags to Check
- Superlatives without evidence ("best," "fastest," "most")
- Absolute statements ("always," "never," "all")
- Outdated information
- Unsourced statistics
- Misleading correlations presented as causation
- Cherry-picked data
- Logical fallacies

### 4. Verification Checklist
✓ All statistics have sources?
✓ Dates and timelines accurate?
✓ Quotes properly attributed?
✓ No misleading claims?
✓ Data presented in context?
✓ No logical fallacies?
✓ Claims align with current knowledge?

## Evaluation Scoring

**Score 1.0 (Excellent):**
- All facts verified and accurate
- Proper citations and sources
- No misleading information
- Data presented objectively

**Score 0.8 (Good):**
- Most facts verified
- Minor citation issues
- Generally accurate with small gaps

**Score 0.6 (Acceptable):**
- Some unverified claims
- Missing sources
- Potential accuracy concerns

**Score 0.4 (Needs Work):**
- Multiple unverified claims
- Questionable accuracy
- Missing critical sources

**Score 0.2 (Poor):**
- Significant factual errors
- No source verification
- Misleading information

## Required Output (JSON)
{{
    "score": 0.0-1.0,
    "feedback": "Detailed analysis of factual accuracy with specific examples",
    "confidence": 0.0-1.0,
    "evidence": [
        "Verified fact 1 with source",
        "Unverified claim 2 - needs source",
        "Accurate statistic 3 from X source"
    ],
    "issues_found": [
        {{"claim": "specific claim", "issue": "problem description", "severity": "high|medium|low"}},
    ],
    "verified_facts": 15,
    "unverified_claims": 2,
    "flagged_concerns": ["specific concerns"]
}}

Evaluate now with rigorous fact-checking standards.
"""

    @staticmethod
    def get_brand_checker_prompt(deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """
        Sophisticated brand compliance evaluation prompt.
        Validates voice, tone, messaging, and visual brand alignment.
        """
        brand_guidelines = task.get('brand_guidelines', {})
        
        return f"""
# Brand Checker Agent - Brand Compliance Evaluation

## Your Role
You are a brand compliance specialist ensuring perfect alignment with brand identity,
voice, tone, and messaging guidelines.

## Deliverable to Evaluate
{json.dumps(deliverable_data, indent=2)}

## Brand Guidelines
{json.dumps(brand_guidelines, indent=2)}

## Brand Compliance Framework

### 1. Voice & Tone Analysis
- **Brand Voice:** Does content reflect the established brand personality?
- **Tone Consistency:** Is tone appropriate for audience and context?
- **Language Style:** Does vocabulary match brand character?
- **Formality Level:** Appropriate formal vs casual balance?

### 2. Messaging Alignment
- **Core Messages:** Do statements align with brand positioning?
- **Value Proposition:** Is brand value clearly communicated?
- **Unique Selling Points:** Are USPs highlighted correctly?
- **Brand Promise:** Content reflects brand commitments?

### 3. Visual Brand Elements (if applicable)
- **Color Palette:** Correct brand colors used?
- **Typography:** Font families match brand guidelines?
- **Logo Usage:** Proper logo placement and treatment?
- **Visual Style:** Images align with brand aesthetics?

### 4. Content Guidelines
- **Prohibited Terms:** No use of forbidden language?
- **Preferred Terminology:** Correct brand-specific terms?
- **Competitor References:** Handled appropriately?
- **Legal Compliance:** All disclaimers and legal language present?

### 5. Brand Violations to Flag
❌ Off-brand language or tone
❌ Inconsistent messaging
❌ Conflicting value propositions
❌ Unauthorized visual elements
❌ Missing brand elements
❌ Competitor confusion
❌ Legal or compliance issues

## Evaluation Scoring

**Score 1.0 (Perfect Brand Alignment):**
- Flawless voice and tone
- Perfect message alignment
- All visual elements correct
- Exemplary brand representation

**Score 0.8 (Strong Alignment):**
- Minor tone adjustments needed
- Message mostly aligned
- Small visual tweaks

**Score 0.6 (Acceptable with Issues):**
- Some voice inconsistencies
- Messaging partially aligned
- Visual elements need work

**Score 0.4 (Significant Misalignment):**
- Wrong tone or voice
- Message conflicts with brand
- Visual violations

**Score 0.2 (Off-Brand):**
- Complete brand misalignment
- Wrong messaging
- Violates guidelines

## Required Output (JSON)
{{
    "score": 0.0-1.0,
    "feedback": "Detailed brand compliance analysis",
    "confidence": 0.0-1.0,
    "evidence": [
        "On-brand example 1",
        "Off-brand element 2"
    ],
    "voice_score": 0.0-1.0,
    "tone_score": 0.0-1.0,
    "messaging_score": 0.0-1.0,
    "visual_score": 0.0-1.0,
    "violations": [
        {{"element": "specific element", "issue": "problem", "severity": "high|medium|low"}}
    ],
    "recommendations": ["specific improvements"]
}}

Evaluate with strict brand standards.
"""

    @staticmethod
    def get_seo_evaluator_prompt(deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """
        Sophisticated SEO optimization evaluation prompt.
        Validates search optimization, content structure, and ranking factors.
        """
        return f"""
# SEO Evaluator Agent - Search Optimization Evaluation

## Your Role
You are an SEO specialist evaluating content for search engine optimization,
discoverability, and ranking potential.

## Deliverable to Evaluate
{json.dumps(deliverable_data, indent=2)}

## SEO Evaluation Framework

### 1. Keyword Optimization
- **Target Keywords:** Are primary keywords present and natural?
- **Keyword Density:** Appropriate keyword frequency (1-3%)?
- **Semantic Keywords:** Related terms and synonyms included?
- **Keyword Placement:** Keywords in key positions (title, headings, first paragraph)?
- **Avoid:** Keyword stuffing, unnatural placement

### 2. Content Structure
- **Title Tag:** Compelling, keyword-rich, under 60 characters?
- **Meta Description:** Engaging, under 160 characters, with CTA?
- **Headings (H1-H6):** Logical hierarchy, keyword-optimized?
- **URL Structure:** Clean, descriptive, keyword-containing?
- **Content Length:** Sufficient depth for topic (typically 1500+ words)?

### 3. On-Page SEO Elements
✓ **Title Optimization:** Engaging + keyword-rich
✓ **Headers:** H1, H2, H3 with keywords
✓ **Image Alt Text:** Descriptive and keyword-relevant
✓ **Internal Links:** Relevant anchor text
✓ **External Links:** Authority sources
✓ **Schema Markup:** Structured data where applicable

### 4. Content Quality for SEO
- **E-E-A-T:** Experience, Expertise, Authoritativeness, Trust
- **User Intent:** Matches search intent (informational/transactional)?
- **Readability:** Clear, scannable, well-formatted?
- **Uniqueness:** Original, not duplicated content?
- **Freshness:** Current, up-to-date information?

### 5. Technical SEO Factors
- **Mobile-Friendly:** Responsive design consideration?
- **Page Speed:** Content optimized for fast loading?
- **Crawlability:** Clear structure for search engines?

### 6. Engagement Signals
- **Compelling Introduction:** Hooks reader immediately?
- **Clear Value Proposition:** Why should user stay?
- **Scannable Format:** Bullets, short paragraphs, subheadings?
- **Call-to-Action:** Clear next steps?

## SEO Scoring

**Score 1.0 (SEO Optimized):**
- Perfect keyword integration
- Excellent structure
- All elements optimized
- High ranking potential

**Score 0.8 (Well Optimized):**
- Good keyword usage
- Strong structure
- Minor improvements possible

**Score 0.6 (Basic SEO):**
- Some optimization present
- Structure needs work
- Missing key elements

**Score 0.4 (Weak SEO):**
- Poor keyword integration
- Structural issues
- Multiple missing elements

**Score 0.2 (Not Optimized):**
- No SEO consideration
- Poor structure
- Won't rank

## Required Output (JSON)
{{
    "score": 0.0-1.0,
    "feedback": "Comprehensive SEO analysis with specific recommendations",
    "confidence": 0.0-1.0,
    "evidence": [
        "Strong SEO element 1",
        "Missing SEO element 2"
    ],
    "keyword_score": 0.0-1.0,
    "structure_score": 0.0-1.0,
    "technical_score": 0.0-1.0,
    "target_keywords": ["identified keywords"],
    "keyword_density": "X%",
    "issues": [
        {{"element": "specific element", "issue": "SEO problem", "priority": "high|medium|low"}}
    ],
    "recommendations": [
        "Add keyword X to title",
        "Improve meta description",
        "Add internal links"
    ],
    "ranking_potential": "high|medium|low"
}}

Evaluate with modern SEO best practices.
"""

    @staticmethod
    def get_audience_checker_prompt(deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """
        Sophisticated audience alignment evaluation prompt.
        Validates demographic fit, relevance, and engagement potential.
        """
        audience_profile = task.get('audience_profile', {})
        
        return f"""
# Audience Alignment Agent - Target Audience Evaluation

## Your Role
You are an audience analysis expert evaluating content relevance, appropriateness,
and engagement potential for the target audience.

## Deliverable to Evaluate
{json.dumps(deliverable_data, indent=2)}

## Target Audience Profile
{json.dumps(audience_profile, indent=2)}

## Audience Alignment Framework

### 1. Demographic Fit
- **Age Appropriateness:** Language and examples suitable for age group?
- **Cultural Sensitivity:** Culturally aware and inclusive?
- **Education Level:** Complexity matches audience education?
- **Industry Knowledge:** Assumes right level of expertise?

### 2. Psychographic Alignment
- **Values & Beliefs:** Resonates with audience values?
- **Pain Points:** Addresses real audience problems?
- **Goals & Aspirations:** Connects with audience objectives?
- **Interests:** Topics and examples relevant?

### 3. Communication Style
- **Formality Level:** Appropriate casual vs professional tone?
- **Technical Jargon:** Right amount for audience expertise?
- **Examples & Analogies:** Relatable and understandable?
- **Humor & References:** Culturally and age-appropriate?

### 4. Content Relevance
- **Problem-Solution Fit:** Addresses actual audience needs?
- **Timing & Context:** Relevant to current situation?
- **Actionability:** Can audience apply information?
- **Value Delivery:** Clear benefit to audience?

### 5. Engagement Potential
🎯 **Hook Quality:** Captures attention immediately?
🎯 **Emotional Connection:** Creates empathy or excitement?
🎯 **Relatability:** "This is for me" feeling?
🎯 **Share-Worthiness:** Would audience share with others?
🎯 **Action Trigger:** Motivates desired behavior?

### 6. Accessibility & Inclusivity
- **Language Accessibility:** Clear and understandable?
- **Visual Accessibility:** Images/design accessible?
- **Inclusive Language:** Non-discriminatory and welcoming?
- **Diverse Representation:** Reflects audience diversity?

### 7. Red Flags for Misalignment
❌ Wrong sophistication level
❌ Irrelevant examples or references
❌ Inappropriate tone or humor
❌ Ignores audience pain points
❌ Assumes wrong knowledge level
❌ Culturally insensitive
❌ Excludes segments of audience

## Audience Scoring

**Score 1.0 (Perfect Fit):**
- Precisely targeted
- Highly relevant
- Maximum engagement potential
- Perfectly accessible

**Score 0.8 (Strong Alignment):**
- Well-targeted
- Mostly relevant
- Good engagement potential
- Generally accessible

**Score 0.6 (Adequate Fit):**
- Somewhat targeted
- Partially relevant
- Moderate engagement
- Some accessibility issues

**Score 0.4 (Weak Alignment):**
- Poorly targeted
- Limited relevance
- Low engagement potential
- Accessibility concerns

**Score 0.2 (Misaligned):**
- Wrong audience
- Irrelevant content
- Won't engage
- Not accessible

## Required Output (JSON)
{{
    "score": 0.0-1.0,
    "feedback": "Detailed audience alignment analysis",
    "confidence": 0.0-1.0,
    "evidence": [
        "Well-aligned element 1",
        "Misaligned element 2"
    ],
    "demographic_fit": 0.0-1.0,
    "relevance_score": 0.0-1.0,
    "engagement_potential": 0.0-1.0,
    "accessibility_score": 0.0-1.0,
    "strengths": ["specific strengths"],
    "misalignments": [
        {{"element": "specific element", "issue": "alignment problem", "impact": "high|medium|low"}}
    ],
    "recommendations": [
        "Adjust tone for younger audience",
        "Add industry-specific examples"
    ],
    "predicted_engagement": "high|medium|low"
}}

Evaluate with deep audience empathy.
"""

    @staticmethod
    def get_technical_validator_prompt(deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """
        Sophisticated technical validation evaluation prompt.
        Validates accuracy, completeness, and implementation quality.
        """
        return f"""
# Technical Validator Agent - Technical Quality Evaluation

## Your Role
You are a technical expert validating accuracy, completeness, clarity,
and implementation quality of deliverables.

## Deliverable to Evaluate
{json.dumps(deliverable_data, indent=2)}

## Technical Validation Framework

### 1. Accuracy & Correctness
- **Technical Accuracy:** All technical information correct?
- **Best Practices:** Follows industry standards?
- **Current Standards:** Uses up-to-date approaches?
- **No Errors:** Free from technical mistakes?

### 2. Completeness
✓ All requirements addressed?
✓ No critical gaps?
✓ Edge cases considered?
✓ Dependencies documented?
✓ Assumptions stated?
✓ Limitations acknowledged?

### 3. Clarity & Documentation
- **Clear Instructions:** Easy to understand and follow?
- **Proper Structure:** Logical organization?
- **Code Quality:** (if applicable) Well-written and commented?
- **Examples:** Concrete, working examples provided?
- **Explanations:** Complex concepts explained well?

### 4. Implementation Quality
- **Actionability:** Can be implemented as described?
- **Efficiency:** Optimal approach recommended?
- **Scalability:** Works at scale?
- **Security:** Security considerations addressed?
- **Performance:** Performance implications considered?

### 5. Technical Completeness
📋 **Requirements Coverage:** All specs met?
📋 **Configuration:** Setup instructions clear?
📋 **Dependencies:** All dependencies listed?
📋 **Testing:** Testing approach included?
📋 **Troubleshooting:** Common issues addressed?
📋 **Maintenance:** Ongoing maintenance considered?

### 6. Technical Red Flags
❌ Deprecated approaches
❌ Security vulnerabilities
❌ Performance bottlenecks
❌ Missing error handling
❌ Incomplete specifications
❌ Outdated technology
❌ Non-scalable solutions
❌ Poor code quality

### 7. Quality Standards
- **Industry Standards:** Follows relevant standards (ISO, RFC, etc.)?
- **Platform Guidelines:** Adheres to platform requirements?
- **Accessibility:** Meets accessibility standards?
- **Compatibility:** Works across environments?

## Technical Scoring

**Score 1.0 (Excellent):**
- 100% technically accurate
- Complete and thorough
- Crystal clear documentation
- Production-ready quality

**Score 0.8 (Good):**
- Mostly accurate
- Minor gaps
- Good documentation
- Needs small refinements

**Score 0.6 (Acceptable):**
- Generally accurate
- Some gaps exist
- Documentation adequate
- Needs improvements

**Score 0.4 (Needs Work):**
- Technical issues present
- Significant gaps
- Unclear documentation
- Not production-ready

**Score 0.2 (Poor):**
- Major technical errors
- Incomplete
- Poor documentation
- Not implementable

## Required Output (JSON)
{{
    "score": 0.0-1.0,
    "feedback": "Comprehensive technical analysis",
    "confidence": 0.0-1.0,
    "evidence": [
        "Technically sound element 1",
        "Technical issue 2"
    ],
    "accuracy_score": 0.0-1.0,
    "completeness_score": 0.0-1.0,
    "clarity_score": 0.0-1.0,
    "implementation_score": 0.0-1.0,
    "technical_issues": [
        {{"component": "specific part", "issue": "technical problem", "severity": "critical|high|medium|low"}}
    ],
    "gaps_identified": ["missing element 1", "missing element 2"],
    "best_practices_followed": ["practice 1", "practice 2"],
    "best_practices_violated": ["violation 1"],
    "recommendations": [
        "Add error handling",
        "Update deprecated code",
        "Improve documentation"
    ],
    "production_ready": true|false
}}

Evaluate with rigorous technical standards.
"""

    @staticmethod
    def get_evaluator_prompt(evaluator_id: str, evaluator_info: Dict[str, Any], 
                            deliverable_data: Dict[str, Any], rubric: Any, task: Dict[str, Any]) -> str:
        """Get the appropriate enhanced prompt for an evaluator"""
        
        prompt_map = {
            "fact_checker": EnhancedEvaluatorPrompts.get_fact_checker_prompt,
            "brand_checker": EnhancedEvaluatorPrompts.get_brand_checker_prompt,
            "seo_evaluator": EnhancedEvaluatorPrompts.get_seo_evaluator_prompt,
            "audience_checker": EnhancedEvaluatorPrompts.get_audience_checker_prompt,
            "technical_validator": EnhancedEvaluatorPrompts.get_technical_validator_prompt
        }
        
        prompt_func = prompt_map.get(evaluator_id)
        
        if prompt_func:
            return prompt_func(deliverable_data, rubric, task)
        else:
            # Fallback to basic prompt
            return f"""
# {evaluator_info['name']} Evaluation

Evaluate the following deliverable:

{json.dumps(deliverable_data, indent=2)}

Provide score (0.0-1.0), detailed feedback, and confidence level.

Return JSON:
{{
    "score": 0.85,
    "feedback": "Detailed evaluation feedback",
    "confidence": 0.9,
    "evidence": ["example 1", "example 2"]
}}
"""

