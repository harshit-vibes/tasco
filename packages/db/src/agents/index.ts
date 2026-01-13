/**
 * Agent CRUD Operations
 *
 * Manages agent metadata and suggestions stored in DynamoDB
 */

import {
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildAgentPK, buildAgentSK } from "../tables";
import type { Agent, CreateAgentInput, UpdateAgentInput, AgentSuggestion } from "./types";

export * from "./types";

/**
 * Create a new agent
 */
export async function createAgent(input: CreateAgentInput): Promise<Agent> {
  const now = new Date().toISOString();
  const pk = buildAgentPK(input.appId);
  const sk = buildAgentSK(input.agentKey);

  const agent: Agent = {
    pk,
    sk,
    appId: input.appId,
    agentKey: input.agentKey,
    lyzrAgentId: input.lyzrAgentId,
    name: input.name,
    shortName: input.shortName,
    description: input.description,
    icon: input.icon,
    colorClass: input.colorClass,
    bgClass: input.bgClass,
    kbId: input.kbId,
    suggestions: input.suggestions || [],
    isDefault: input.isDefault ?? false,
    isEnabled: input.isEnabled ?? true,
    order: input.order ?? 0,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.AGENTS,
      Item: agent,
    })
  );

  return agent;
}

/**
 * Get an agent by appId and agentKey
 */
export async function getAgent(
  appId: string,
  agentKey: string
): Promise<Agent | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.AGENTS,
      Key: {
        pk: buildAgentPK(appId),
        sk: buildAgentSK(agentKey),
      },
    })
  );

  return (result.Item as Agent) || null;
}

/**
 * Get all agents for an app
 */
export async function getAgentsByApp(appId: string): Promise<Agent[]> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLES.AGENTS,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": buildAgentPK(appId),
      },
    })
  );

  const agents = (result.Items as Agent[]) || [];

  // Sort by order
  return agents.sort((a, b) => a.order - b.order);
}

/**
 * Get enabled agents for an app
 */
export async function getEnabledAgentsByApp(appId: string): Promise<Agent[]> {
  const agents = await getAgentsByApp(appId);
  return agents.filter((a) => a.isEnabled);
}

/**
 * Update an agent
 */
export async function updateAgent(
  appId: string,
  agentKey: string,
  updates: UpdateAgentInput
): Promise<Agent | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.name !== undefined) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = updates.name;
  }

  if (updates.shortName !== undefined) {
    updateExpressions.push("shortName = :shortName");
    expressionAttributeValues[":shortName"] = updates.shortName;
  }

  if (updates.description !== undefined) {
    updateExpressions.push("description = :description");
    expressionAttributeValues[":description"] = updates.description;
  }

  if (updates.icon !== undefined) {
    updateExpressions.push("icon = :icon");
    expressionAttributeValues[":icon"] = updates.icon;
  }

  if (updates.colorClass !== undefined) {
    updateExpressions.push("colorClass = :colorClass");
    expressionAttributeValues[":colorClass"] = updates.colorClass;
  }

  if (updates.bgClass !== undefined) {
    updateExpressions.push("bgClass = :bgClass");
    expressionAttributeValues[":bgClass"] = updates.bgClass;
  }

  if (updates.kbId !== undefined) {
    updateExpressions.push("kbId = :kbId");
    expressionAttributeValues[":kbId"] = updates.kbId;
  }

  if (updates.suggestions !== undefined) {
    updateExpressions.push("suggestions = :suggestions");
    expressionAttributeValues[":suggestions"] = updates.suggestions;
  }

  if (updates.isEnabled !== undefined) {
    updateExpressions.push("isEnabled = :isEnabled");
    expressionAttributeValues[":isEnabled"] = updates.isEnabled;
  }

  if (updates.order !== undefined) {
    updateExpressions.push("#order = :order");
    expressionAttributeNames["#order"] = "order";
    expressionAttributeValues[":order"] = updates.order;
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.AGENTS,
      Key: {
        pk: buildAgentPK(appId),
        sk: buildAgentSK(agentKey),
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return (result.Attributes as Agent) || null;
}

/**
 * Delete an agent
 */
export async function deleteAgent(
  appId: string,
  agentKey: string
): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.AGENTS,
      Key: {
        pk: buildAgentPK(appId),
        sk: buildAgentSK(agentKey),
      },
    })
  );
}

/**
 * Add a suggestion to an agent
 */
export async function addSuggestion(
  appId: string,
  agentKey: string,
  suggestion: AgentSuggestion
): Promise<Agent | null> {
  const agent = await getAgent(appId, agentKey);
  if (!agent) return null;

  const suggestions = [...agent.suggestions, suggestion];
  return updateAgent(appId, agentKey, { suggestions });
}

/**
 * Remove a suggestion from an agent
 */
export async function removeSuggestion(
  appId: string,
  agentKey: string,
  suggestionId: string
): Promise<Agent | null> {
  const agent = await getAgent(appId, agentKey);
  if (!agent) return null;

  const suggestions = agent.suggestions.filter((s) => s.id !== suggestionId);
  return updateAgent(appId, agentKey, { suggestions });
}

/**
 * Update suggestions for an agent
 */
export async function updateSuggestions(
  appId: string,
  agentKey: string,
  suggestions: AgentSuggestion[]
): Promise<Agent | null> {
  return updateAgent(appId, agentKey, { suggestions });
}

/**
 * Get all suggestions for an app (across all agents)
 */
export async function getAllSuggestionsByApp(
  appId: string
): Promise<Array<AgentSuggestion & { agentKey: string }>> {
  const agents = await getEnabledAgentsByApp(appId);

  const allSuggestions: Array<AgentSuggestion & { agentKey: string }> = [];

  for (const agent of agents) {
    for (const suggestion of agent.suggestions) {
      allSuggestions.push({
        ...suggestion,
        agentKey: agent.agentKey,
      });
    }
  }

  return allSuggestions;
}

/**
 * Get the default agent for an app
 */
export async function getDefaultAgent(appId: string): Promise<Agent | null> {
  const agents = await getAgentsByApp(appId);
  return agents.find((a) => a.isDefault) || agents[0] || null;
}
