import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildCampaignPK, CAMPAIGN_METADATA_SK } from "../tables";
import type {
  Campaign,
  CampaignItem,
  CreateCampaignInput,
  UpdateCampaignInput,
} from "./types";

/**
 * Generate a unique campaign ID
 */
const generateId = (): string => {
  return `camp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Campaign
 */
const itemToCampaign = (item: CampaignItem): Campaign => {
  const { pk, sk, ...campaign } = item;
  return campaign as Campaign;
};

/**
 * Create a new campaign
 */
export async function createCampaign(
  input: CreateCampaignInput
): Promise<Campaign> {
  const id = input.id || generateId();
  const now = new Date().toISOString();

  const item: CampaignItem = {
    pk: buildCampaignPK(id),
    sk: CAMPAIGN_METADATA_SK,
    id,
    name: input.name,
    type: input.type,
    status: input.status || "draft",
    targetSegment: input.targetSegment,
    budget: input.budget,
    startDate: input.startDate,
    endDate: input.endDate,
    metrics: {
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      revenue: 0,
    },
    createdBy: input.createdBy,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.CAMPAIGNS,
      Item: item,
    })
  );

  return itemToCampaign(item);
}

/**
 * Get a single campaign by ID
 */
export async function getCampaignById(
  campaignId: string
): Promise<Campaign | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.CAMPAIGNS,
      Key: {
        pk: buildCampaignPK(campaignId),
        sk: CAMPAIGN_METADATA_SK,
      },
    })
  );

  return result.Item ? itemToCampaign(result.Item as CampaignItem) : null;
}

/**
 * Get all campaigns
 */
export async function getAllCampaigns(): Promise<Campaign[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CAMPAIGNS,
    })
  );

  return (result.Items || []).map((item) =>
    itemToCampaign(item as CampaignItem)
  );
}

/**
 * Get active campaigns
 */
export async function getActiveCampaigns(): Promise<Campaign[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CAMPAIGNS,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": "active",
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToCampaign(item as CampaignItem)
  );
}

/**
 * Get campaigns by entity
 */
export async function getCampaignsByEntity(
  entityId: string
): Promise<Campaign[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CAMPAIGNS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
    })
  );

  return (result.Items || []).map((item) =>
    itemToCampaign(item as CampaignItem)
  );
}

/**
 * Update a campaign
 */
export async function updateCampaign(
  campaignId: string,
  updates: UpdateCampaignInput
): Promise<Campaign | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, any> = {
    ":updatedAt": new Date().toISOString(),
  };

  if (updates.name !== undefined) {
    updateExpressions.push("#name = :name");
    expressionAttributeNames["#name"] = "name";
    expressionAttributeValues[":name"] = updates.name;
  }

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.targetSegment !== undefined) {
    updateExpressions.push("targetSegment = :targetSegment");
    expressionAttributeValues[":targetSegment"] = updates.targetSegment;
  }

  if (updates.budget !== undefined) {
    updateExpressions.push("budget = :budget");
    expressionAttributeValues[":budget"] = updates.budget;
  }

  if (updates.endDate !== undefined) {
    updateExpressions.push("endDate = :endDate");
    expressionAttributeValues[":endDate"] = updates.endDate;
  }

  if (updates.metrics) {
    if (updates.metrics.sent !== undefined) {
      updateExpressions.push("metrics.sent = :sent");
      expressionAttributeValues[":sent"] = updates.metrics.sent;
    }
    if (updates.metrics.delivered !== undefined) {
      updateExpressions.push("metrics.delivered = :delivered");
      expressionAttributeValues[":delivered"] = updates.metrics.delivered;
    }
    if (updates.metrics.opened !== undefined) {
      updateExpressions.push("metrics.opened = :opened");
      expressionAttributeValues[":opened"] = updates.metrics.opened;
    }
    if (updates.metrics.clicked !== undefined) {
      updateExpressions.push("metrics.clicked = :clicked");
      expressionAttributeValues[":clicked"] = updates.metrics.clicked;
    }
    if (updates.metrics.converted !== undefined) {
      updateExpressions.push("metrics.converted = :converted");
      expressionAttributeValues[":converted"] = updates.metrics.converted;
    }
    if (updates.metrics.revenue !== undefined) {
      updateExpressions.push("metrics.revenue = :revenue");
      expressionAttributeValues[":revenue"] = updates.metrics.revenue;
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.CAMPAIGNS,
      Key: {
        pk: buildCampaignPK(campaignId),
        sk: CAMPAIGN_METADATA_SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes
    ? itemToCampaign(result.Attributes as CampaignItem)
    : null;
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.CAMPAIGNS,
      Key: {
        pk: buildCampaignPK(campaignId),
        sk: CAMPAIGN_METADATA_SK,
      },
    })
  );
}

/**
 * Get campaign stats
 */
export async function getCampaignStats(): Promise<{
  total: number;
  active: number;
  completed: number;
  totalBudget: number;
  totalRevenue: number;
  averageROI: number;
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.CAMPAIGNS,
    })
  );

  const campaigns = (result.Items || []).map((item) =>
    itemToCampaign(item as CampaignItem)
  );

  const active = campaigns.filter((c) => c.status === "active").length;
  const completed = campaigns.filter((c) => c.status === "completed").length;

  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalRevenue = campaigns.reduce(
    (sum, c) => sum + (c.metrics.revenue || 0),
    0
  );

  const averageROI =
    totalBudget > 0 ? (totalRevenue - totalBudget) / totalBudget : 0;

  return {
    total: campaigns.length,
    active,
    completed,
    totalBudget,
    totalRevenue,
    averageROI,
  };
}
