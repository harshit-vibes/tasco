#!/usr/bin/env python3
"""
Create Lyzr Agent via v3 API

A global script to create agents for any Tasco app.

Usage:
    # Interactive mode
    python scripts/create-agent.py

    # With arguments
    python scripts/create-agent.py --name "My Agent" --prompt "You are a helpful assistant"

    # From prompt file
    python scripts/create-agent.py --name "My Agent" --prompt-file path/to/prompt.txt

    # Full options
    python scripts/create-agent.py \
        --name "Validation Agent" \
        --description "Validates responses" \
        --prompt "You are..." \
        --model gpt-4o-mini \
        --temperature 0.1 \
        --provider openai

Examples:
    # Create a validation agent
    python scripts/create-agent.py --name "Compliance Validation Agent" --prompt-file apps/compliance-qa/validation-agent-prompt.txt --temperature 0.1

    # Create a simple chat agent
    python scripts/create-agent.py --name "E-Learning Assistant" --prompt "You are an e-learning assistant that helps users learn new topics."
"""

import argparse
import json
import os
import sys
from pathlib import Path

try:
    import httpx
except ImportError:
    print("Installing httpx...")
    os.system("pip install httpx")
    import httpx

try:
    from dotenv import load_dotenv
except ImportError:
    print("Installing python-dotenv...")
    os.system("pip install python-dotenv")
    from dotenv import load_dotenv

# Base URL for Lyzr Agent API
BASE_URL = "https://agent-prod.studio.lyzr.ai"

# Default configurations
DEFAULTS = {
    "provider_id": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.7,
    "top_p": 0.9,
}


def load_api_key():
    """Load API key from environment or .env files"""
    # Try loading from various .env locations
    env_locations = [
        Path.cwd() / ".env",
        Path.cwd() / ".env.local",
        Path.cwd() / "apps" / "compliance-qa" / ".env.local",
    ]

    for env_path in env_locations:
        if env_path.exists():
            load_dotenv(dotenv_path=str(env_path))
            break

    api_key = os.getenv("NEXT_PUBLIC_LYZR_API_KEY") or os.getenv("LYZR_API_KEY") or os.getenv("X_API_KEY")
    return api_key


def create_agent(
    name: str,
    prompt: str,
    description: str = None,
    provider_id: str = None,
    model: str = None,
    temperature: float = None,
    top_p: float = None,
    features: list = None,
    tools: list = None,
    response_format: dict = None,
    api_key: str = None,
) -> dict:
    """Create an agent via v3 API"""

    if not api_key:
        api_key = load_api_key()

    if not api_key:
        raise ValueError("No API key found. Set NEXT_PUBLIC_LYZR_API_KEY or LYZR_API_KEY")

    headers = {
        "Content-Type": "application/json",
        "x-api-key": api_key,
    }

    payload = {
        "name": name,
        "description": description or f"Agent: {name}",
        "agent_instructions": prompt,
        "provider_id": provider_id or DEFAULTS["provider_id"],
        "model": model or DEFAULTS["model"],
        "temperature": temperature if temperature is not None else DEFAULTS["temperature"],
        "top_p": top_p if top_p is not None else DEFAULTS["top_p"],
        "features": features or [],
        "tools": tools or [],
        "store_messages": True,
    }

    if response_format:
        payload["response_format"] = response_format

    response = httpx.post(
        f"{BASE_URL}/v3/agents/",
        headers=headers,
        json=payload,
        timeout=60.0
    )

    if response.status_code in [200, 201]:
        return response.json()
    else:
        raise Exception(f"API error {response.status_code}: {response.text[:500]}")


def main():
    parser = argparse.ArgumentParser(
        description="Create a Lyzr agent via v3 API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --name "My Agent" --prompt "You are a helpful assistant"
  %(prog)s --name "Validator" --prompt-file prompt.txt --temperature 0.1
  %(prog)s --name "RAG Agent" --model gpt-4o --features '["KNOWLEDGE_BASE"]'
        """
    )

    parser.add_argument("--name", "-n", required=True, help="Agent name")
    parser.add_argument("--prompt", "-p", help="System prompt (direct text)")
    parser.add_argument("--prompt-file", "-f", help="Path to file containing system prompt")
    parser.add_argument("--description", "-d", help="Agent description")
    parser.add_argument("--provider", default="openai", help="LLM provider (default: openai)")
    parser.add_argument("--model", "-m", default="gpt-4o-mini", help="Model name (default: gpt-4o-mini)")
    parser.add_argument("--temperature", "-t", type=float, default=0.7, help="Temperature (default: 0.7)")
    parser.add_argument("--top-p", type=float, default=0.9, help="Top P (default: 0.9)")
    parser.add_argument("--json-output", action="store_true", help="Configure agent to return JSON (uses response_format API)")
    parser.add_argument("--features", help="Features as JSON array (e.g., '[\"SHORT_TERM_MEMORY\"]')")
    parser.add_argument("--tools", help="Tools as JSON array")
    parser.add_argument("--api-key", help="Lyzr API key (or set LYZR_API_KEY env var)")
    parser.add_argument("--output", "-o", help="Save agent config to file")
    parser.add_argument("--quiet", "-q", action="store_true", help="Only output agent ID")

    args = parser.parse_args()

    # Get prompt
    if args.prompt_file:
        prompt_path = Path(args.prompt_file)
        if not prompt_path.exists():
            print(f"Error: Prompt file not found: {args.prompt_file}", file=sys.stderr)
            sys.exit(1)
        prompt = prompt_path.read_text()
    elif args.prompt:
        prompt = args.prompt
    else:
        print("Error: Either --prompt or --prompt-file is required", file=sys.stderr)
        sys.exit(1)

    # Parse features and tools if provided
    features = json.loads(args.features) if args.features else None
    tools = json.loads(args.tools) if args.tools else None

    # Response format
    response_format = {"type": "json_object"} if args.json_output else None

    try:
        if not args.quiet:
            print(f"Creating agent: {args.name}")
            print(f"  Provider: {args.provider}")
            print(f"  Model: {args.model}")
            print(f"  Temperature: {args.temperature}")

        result = create_agent(
            name=args.name,
            prompt=prompt,
            description=args.description,
            provider_id=args.provider,
            model=args.model,
            temperature=args.temperature,
            top_p=args.top_p,
            features=features,
            tools=tools,
            response_format=response_format,
            api_key=args.api_key,
        )

        agent_id = result.get("agent_id") or result.get("id")

        if args.quiet:
            print(agent_id)
        else:
            print(f"\n✅ Agent created successfully!")
            print(f"Agent ID: {agent_id}")
            print(f"\nAdd to .env.local:")
            print(f"NEXT_PUBLIC_LYZR_AGENT_ID={agent_id}")

        if args.output:
            output_path = Path(args.output)
            output_path.write_text(json.dumps({
                "agent_id": agent_id,
                "name": args.name,
                "model": args.model,
                "provider": args.provider,
                "full_response": result
            }, indent=2))
            if not args.quiet:
                print(f"\nConfig saved to: {args.output}")

    except Exception as e:
        print(f"Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
