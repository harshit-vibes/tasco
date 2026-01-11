#!/usr/bin/env bun
/**
 * Generate Amplify Environment Variable Configuration
 *
 * This script generates the environment variables needed for each app
 * in AWS Amplify Console. It pulls agent IDs from the centralized
 * @tasco/agents registry.
 *
 * Usage:
 *   bun run scripts/generate-amplify-env.ts [app-name]
 *
 * Examples:
 *   bun run scripts/generate-amplify-env.ts                    # Generate for all apps
 *   bun run scripts/generate-amplify-env.ts compliance-qa      # Generate for specific app
 *   bun run scripts/generate-amplify-env.ts --json             # Output as JSON
 */

import { AGENTS, APP_CONFIGS, getEnvVarMappings } from "../packages/agents/src/registry";
import { KNOWLEDGE_BASES, getKBsByApp } from "../packages/agents/src/knowledge-bases";
import type { AppId } from "../packages/agents/src/types";

const APPS: AppId[] = [
  "compliance-qa",
  "e-learning",
  "sales-order",
  "customer-lifecycle",
  "sales-pricing",
  "risk-radar",
  "data-sync",
  "promotion-control",
];

const SUBDOMAINS: Record<AppId, string> = {
  "compliance-qa": "compliance",
  "e-learning": "elearning",
  "sales-order": "orders",
  "customer-lifecycle": "customer",
  "sales-pricing": "pricing",
  "risk-radar": "risk",
  "data-sync": "sync",
  "promotion-control": "promotion",
};

interface AmplifyEnvConfig {
  appName: string;
  appPath: string;
  subdomain: string;
  envVars: Record<string, string>;
}

function generateEnvConfig(appId: AppId): AmplifyEnvConfig {
  const appConfig = APP_CONFIGS[appId];
  const agentMappings = getEnvVarMappings(appId);
  const kbs = getKBsByApp(appId);

  const envVars: Record<string, string> = {
    // Amplify build variables
    APP_NAME: appId,
    APP_PATH: appId,

    // Shared Lyzr config (placeholders - fill in Amplify Console)
    LYZR_API_KEY: "${LYZR_API_KEY}",
    NEXT_PUBLIC_LYZR_API_KEY: "${NEXT_PUBLIC_LYZR_API_KEY}",
    NEXT_PUBLIC_LYZR_BASE_URL: "https://agent-prod.studio.lyzr.ai",
    NEXT_PUBLIC_RAG_URL: "https://rag-prod.studio.lyzr.ai",

    // AWS config (placeholders)
    NEXT_PUBLIC_AWS_REGION: "ap-southeast-1",
    NEXT_PUBLIC_AWS_ACCESS_KEY_ID: "${AWS_ACCESS_KEY_ID}",
    NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY: "${AWS_SECRET_ACCESS_KEY}",
  };

  // Add agent IDs from registry
  for (const mapping of agentMappings) {
    envVars[mapping.envVar] = mapping.agentId;
  }

  // Add KB IDs
  for (const kb of kbs) {
    if (kb.id) {
      envVars[kb.envVar] = kb.id;
      // Also add NEXT_PUBLIC version if needed
      if (!kb.envVar.startsWith("NEXT_PUBLIC_")) {
        envVars[`NEXT_PUBLIC_${kb.envVar}`] = kb.id;
      }
    }
  }

  return {
    appName: appConfig.appName,
    appPath: appId,
    subdomain: SUBDOMAINS[appId],
    envVars,
  };
}

function printEnvConfig(config: AmplifyEnvConfig): void {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`${config.appName}`);
  console.log(`${"=".repeat(60)}`);
  console.log(`Subdomain: ${config.subdomain}.tasco.app`);
  console.log(`App Path:  apps/${config.appPath}`);
  console.log(`\nEnvironment Variables for AWS Amplify Console:`);
  console.log(`${"─".repeat(60)}`);

  const sortedKeys = Object.keys(config.envVars).sort();
  for (const key of sortedKeys) {
    const value = config.envVars[key];
    // Mask sensitive values
    const displayValue = value.startsWith("${") ? value : value;
    console.log(`${key}=${displayValue}`);
  }
}

function printAsEnvFile(config: AmplifyEnvConfig): void {
  console.log(`\n# ${config.appName}`);
  console.log(`# Subdomain: ${config.subdomain}.tasco.app`);
  console.log(`# App Path: apps/${config.appPath}\n`);

  const sortedKeys = Object.keys(config.envVars).sort();
  for (const key of sortedKeys) {
    console.log(`${key}=${config.envVars[key]}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const jsonOutput = args.includes("--json");
  const envOutput = args.includes("--env");
  const appFilter = args.find((arg) => !arg.startsWith("--"));

  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║     TASCO AWS Amplify Environment Configuration          ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  const appsToProcess = appFilter ? [appFilter as AppId] : APPS;
  const configs: AmplifyEnvConfig[] = [];

  for (const appId of appsToProcess) {
    if (!APPS.includes(appId)) {
      console.error(`\n❌ Unknown app: ${appId}`);
      console.error(`Valid apps: ${APPS.join(", ")}`);
      process.exit(1);
    }

    const config = generateEnvConfig(appId);
    configs.push(config);

    if (jsonOutput) {
      // Skip printing for JSON output
    } else if (envOutput) {
      printAsEnvFile(config);
    } else {
      printEnvConfig(config);
    }
  }

  if (jsonOutput) {
    console.log(JSON.stringify(configs, null, 2));
    return;
  }

  // Print summary
  console.log(`\n${"=".repeat(60)}`);
  console.log("SUMMARY");
  console.log(`${"=".repeat(60)}`);
  console.log("\nSubdomain Mapping:");
  console.log("─".repeat(40));
  for (const config of configs) {
    console.log(`  ${config.subdomain.padEnd(12)} → apps/${config.appPath}`);
  }

  console.log("\nNext Steps:");
  console.log("─".repeat(40));
  console.log("1. Create 8 Amplify apps (one per subdomain)");
  console.log("2. Connect each to the GitHub repo (dev branch)");
  console.log("3. Set APP_PATH and APP_NAME environment variables");
  console.log("4. Add shared credentials (LYZR_API_KEY, AWS_*)");
  console.log("5. Configure custom domain with subdomains");
  console.log("\nFor detailed instructions, see docs/DEPLOYMENT.md");
}

main();
