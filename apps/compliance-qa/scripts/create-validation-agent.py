"""
Create a Validation Agent for Compliance Super AI via v3 API

This script creates a validation agent that evaluates AI responses and returns
structured JSON with validation scores and rationale.

Usage:
    python scripts/create-validation-agent.py
"""

import os
import json
from pathlib import Path
from dotenv import load_dotenv
import httpx

# Get the script's directory and load .env.local from parent
script_dir = Path(__file__).resolve().parent
env_path = script_dir.parent / ".env.local"
load_dotenv(dotenv_path=str(env_path))

# Validation Agent System Prompt
VALIDATION_SYSTEM_PROMPT = """You are a Response Validation Agent for an AI Compliance Assistant. Your role is to evaluate AI responses for quality, accuracy, and groundedness.

IMPORTANT: You MUST ALWAYS respond with ONLY a valid JSON object. No explanations, no markdown, no additional text.

## Evaluation Criteria

1. **Response Quality (0-100)**: Overall quality considering completeness, clarity, and relevance
2. **Citation Quality (0-100)**: How well the response cites and uses source documents (0 if no citations expected)
3. **Response Completeness (0-100)**: Whether the response fully addresses the user's question
4. **Groundedness**: Whether claims are supported by provided context/documents
5. **Confidence**: Your confidence level in the evaluation (high/medium/low)

## Input Format
You will receive:
- User Query: The original question
- AI Response: The response to evaluate
- Has Citations: Whether the response should have citations

## Output Format
Respond with ONLY this JSON structure (no markdown, no explanation):

{
  "score": <0-100>,
  "rationale": "<brief explanation of the score>",
  "hasCitations": <true/false>,
  "citationQuality": <0-100>,
  "responseCompleteness": <0-100>,
  "isGrounded": <true/false>,
  "confidence": "<high|medium|low>"
}

## Scoring Guidelines

- **90-100**: Excellent - Comprehensive, accurate, well-cited response
- **70-89**: Good - Mostly complete with minor gaps
- **50-69**: Fair - Addresses question but lacks depth or citations
- **30-49**: Poor - Incomplete or inaccurate response
- **0-29**: Very Poor - Does not address the question

## Example

Input:
User Query: "What is the board approval threshold for procurement?"
AI Response: "According to the Procurement Policy, purchases over $100,000 require Board approval."
Has Citations: true

Output:
{"score": 85, "rationale": "Response directly answers the question with specific threshold. Could improve by citing exact policy section.", "hasCitations": true, "citationQuality": 70, "responseCompleteness": 90, "isGrounded": true, "confidence": "high"}

Remember: Output ONLY valid JSON, nothing else."""

# Get API key from environment
API_KEY = os.getenv("NEXT_PUBLIC_LYZR_API_KEY") or os.getenv("X_API_KEY")
BASE_URL = "https://agent-prod.studio.lyzr.ai"


def create_validation_agent_v3():
    """Create validation agent via v3 API"""
    if not API_KEY:
        print("Error: No API key found. Set NEXT_PUBLIC_LYZR_API_KEY in .env.local")
        return None

    headers = {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
    }

    # v3 AgentConfig payload
    agent_payload = {
        "name": "Compliance Validation Agent",
        "description": "Evaluates AI responses for quality, accuracy, and groundedness. Returns structured JSON validation scores.",
        "agent_instructions": VALIDATION_SYSTEM_PROMPT,
        "provider_id": "openai",
        "model": "gpt-4o-mini",
        "temperature": 0.1,  # Low temperature for consistent output
        "top_p": 0.9,
        "features": [],  # No RAG or memory needed
        "tools": [],  # No tools needed
        "store_messages": False,  # Don't need to store validation messages
        "response_format": {"type": "json_object"}  # Force JSON output
    }

    try:
        print(f"Creating agent via {BASE_URL}/v3/agents/...")

        response = httpx.post(
            f"{BASE_URL}/v3/agents/",
            headers=headers,
            json=agent_payload,
            timeout=60.0
        )

        print(f"Response status: {response.status_code}")

        if response.status_code in [200, 201]:
            result = response.json()
            return result
        else:
            print(f"Error: {response.text[:500]}")
            return None

    except Exception as e:
        print(f"Request failed: {e}")
        return None


def print_manual_instructions():
    """Print instructions for manual agent creation in Lyzr Studio"""
    print("\n" + "=" * 60)
    print("MANUAL CREATION INSTRUCTIONS")
    print("=" * 60)

    print("\n📋 To create the validation agent in Lyzr Studio:")
    print("-" * 60)
    print("\n1. Go to: https://studio.lyzr.ai/agent-create")
    print("\n2. Agent Settings:")
    print("   - Name: Compliance Validation Agent")
    print("   - Description: Evaluates AI responses for quality, accuracy,")
    print("     and groundedness. Returns structured JSON validation scores.")
    print("\n3. Model Configuration:")
    print("   - Provider: OpenAI")
    print("   - Model: gpt-4o-mini (fast & cost-effective)")
    print("   - Temperature: 0.1")
    print("   - Top P: 0.9")
    print("\n4. Copy the system prompt from: validation-agent-prompt.txt")
    print("\n5. After creation, copy the Agent ID and add to .env.local:")
    print("   NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID=<your-agent-id>")

    # Save system prompt to file for easy copy/paste
    prompt_file = script_dir.parent / "validation-agent-prompt.txt"
    with open(prompt_file, "w") as f:
        f.write(VALIDATION_SYSTEM_PROMPT)

    print(f"\n📁 System prompt saved to: {prompt_file}")
    print("\n" + "=" * 60)


def main():
    print("\n🤖 Compliance Super AI - Validation Agent Setup")
    print("=" * 60)
    print(f"Using API: {BASE_URL}")
    print(f"API Key: {'Found' if API_KEY else 'Not found'}")

    if not API_KEY:
        print("\n⚠️  No API key found. Showing manual instructions...")
        print_manual_instructions()
        return

    print("\n🔄 Creating validation agent via v3 API...")
    result = create_validation_agent_v3()

    if result:
        agent_id = result.get("agent_id") or result.get("id")

        if agent_id:
            print(f"\n✅ Agent created successfully!")
            print(f"\nAgent ID: {agent_id}")
            print(f"\n📝 Add this to your .env.local file:")
            print(f"NEXT_PUBLIC_LYZR_VALIDATION_AGENT_ID={agent_id}")

            # Save config
            config_file = script_dir.parent / "validation-agent-config.json"
            with open(config_file, "w") as f:
                json.dump({
                    "validation_agent_id": agent_id,
                    "created_via": "v3_api",
                    "base_url": BASE_URL,
                    "full_response": result
                }, f, indent=2)

            print(f"📁 Config saved to: {config_file}")

            # Also save the prompt for reference
            prompt_file = script_dir.parent / "validation-agent-prompt.txt"
            with open(prompt_file, "w") as f:
                f.write(VALIDATION_SYSTEM_PROMPT)
            print(f"📁 Prompt saved to: {prompt_file}")
        else:
            print(f"\n⚠️  Response received but no agent_id found:")
            print(json.dumps(result, indent=2)[:500])
            print_manual_instructions()
    else:
        print("\n⚠️  API creation failed. Showing manual instructions...")
        print_manual_instructions()


if __name__ == "__main__":
    main()
