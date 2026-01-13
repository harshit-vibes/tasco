import {
  PutCommand,
  GetCommand,
  QueryCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import { TABLES, buildLeadPK, LEAD_METADATA_SK } from "../tables";
import type {
  Lead,
  LeadItem,
  CreateLeadInput,
  UpdateLeadInput,
  PaginatedResult,
} from "./types";

/**
 * Generate a unique lead ID
 */
const generateId = (): string => {
  return `lead_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Convert DynamoDB item to Lead
 */
const itemToLead = (item: LeadItem): Lead => {
  const { pk, sk, ...lead } = item;
  return lead as Lead;
};

/**
 * Create a new lead
 */
export async function createLead(input: CreateLeadInput): Promise<Lead> {
  const id = input.id || generateId();
  const now = new Date().toISOString();

  const item: LeadItem = {
    pk: buildLeadPK(id),
    sk: LEAD_METADATA_SK,
    id,
    customer: input.customer,
    source: input.source,
    status: input.status || "new",
    priority: input.priority || "warm",
    score: input.score || 50,
    interest: input.interest,
    assignedTo: input.assignedTo,
    entityId: input.entityId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLES.LEADS,
      Item: item,
    })
  );

  return itemToLead(item);
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(leadId: string): Promise<Lead | null> {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLES.LEADS,
      Key: {
        pk: buildLeadPK(leadId),
        sk: LEAD_METADATA_SK,
      },
    })
  );

  return result.Item ? itemToLead(result.Item as LeadItem) : null;
}

/**
 * Get all leads (with optional pagination)
 */
export async function getAllLeads(
  limit?: number,
  lastKey?: Record<string, any>
): Promise<PaginatedResult<Lead>> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.LEADS,
      Limit: limit,
      ExclusiveStartKey: lastKey,
    })
  );

  return {
    items: (result.Items || []).map((item) => itemToLead(item as LeadItem)),
    lastEvaluatedKey: result.LastEvaluatedKey,
    count: result.Count || 0,
  };
}

/**
 * Get leads by entity ID
 */
export async function getLeadsByEntity(
  entityId: string,
  limit?: number
): Promise<Lead[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.LEADS,
      FilterExpression: "entityId = :entityId",
      ExpressionAttributeValues: {
        ":entityId": entityId,
      },
      Limit: limit,
    })
  );

  return (result.Items || []).map((item) => itemToLead(item as LeadItem));
}

/**
 * Get leads by priority
 */
export async function getLeadsByPriority(
  priority: "hot" | "warm" | "cold"
): Promise<Lead[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.LEADS,
      FilterExpression: "priority = :priority",
      ExpressionAttributeValues: {
        ":priority": priority,
      },
    })
  );

  return (result.Items || []).map((item) => itemToLead(item as LeadItem));
}

/**
 * Get leads by status
 */
export async function getLeadsByStatus(
  status: "new" | "contacted" | "qualified" | "nurturing" | "converted" | "lost"
): Promise<Lead[]> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.LEADS,
      FilterExpression: "#status = :status",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
      },
    })
  );

  return (result.Items || []).map((item) => itemToLead(item as LeadItem));
}

/**
 * Update a lead
 */
export async function updateLead(
  leadId: string,
  updates: UpdateLeadInput
): Promise<Lead | null> {
  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, any> = {
    ":updatedAt": new Date().toISOString(),
  };

  // Customer info updates
  if (updates.customer) {
    if (updates.customer.name !== undefined) {
      updateExpressions.push("customer.#name = :customerName");
      expressionAttributeNames["#name"] = "name";
      expressionAttributeValues[":customerName"] = updates.customer.name;
    }
    if (updates.customer.email !== undefined) {
      updateExpressions.push("customer.email = :customerEmail");
      expressionAttributeValues[":customerEmail"] = updates.customer.email;
    }
    if (updates.customer.phone !== undefined) {
      updateExpressions.push("customer.phone = :customerPhone");
      expressionAttributeValues[":customerPhone"] = updates.customer.phone;
    }
    if (updates.customer.location !== undefined) {
      updateExpressions.push("customer.#location = :customerLocation");
      expressionAttributeNames["#location"] = "location";
      expressionAttributeValues[":customerLocation"] = updates.customer.location;
    }
  }

  if (updates.source !== undefined) {
    updateExpressions.push("#source = :source");
    expressionAttributeNames["#source"] = "source";
    expressionAttributeValues[":source"] = updates.source;
  }

  if (updates.status !== undefined) {
    updateExpressions.push("#status = :status");
    expressionAttributeNames["#status"] = "status";
    expressionAttributeValues[":status"] = updates.status;
  }

  if (updates.priority !== undefined) {
    updateExpressions.push("priority = :priority");
    expressionAttributeValues[":priority"] = updates.priority;
  }

  if (updates.score !== undefined) {
    updateExpressions.push("score = :score");
    expressionAttributeValues[":score"] = updates.score;
  }

  if (updates.assignedTo !== undefined) {
    updateExpressions.push("assignedTo = :assignedTo");
    expressionAttributeValues[":assignedTo"] = updates.assignedTo;
  }

  if (updates.lastContactedAt !== undefined) {
    updateExpressions.push("lastContactedAt = :lastContactedAt");
    expressionAttributeValues[":lastContactedAt"] = updates.lastContactedAt;
  }

  if (updates.aiScore !== undefined) {
    updateExpressions.push("aiScore = :aiScore");
    expressionAttributeValues[":aiScore"] = updates.aiScore;
  }

  // Interest updates
  if (updates.interest) {
    if (updates.interest.brands !== undefined) {
      updateExpressions.push("interest.brands = :interestBrands");
      expressionAttributeValues[":interestBrands"] = updates.interest.brands;
    }
    if (updates.interest.vehicleTypes !== undefined) {
      updateExpressions.push("interest.vehicleTypes = :interestVehicleTypes");
      expressionAttributeValues[":interestVehicleTypes"] = updates.interest.vehicleTypes;
    }
    if (updates.interest.budget !== undefined) {
      updateExpressions.push("interest.budget = :interestBudget");
      expressionAttributeValues[":interestBudget"] = updates.interest.budget;
    }
    if (updates.interest.timeline !== undefined) {
      updateExpressions.push("interest.timeline = :interestTimeline");
      expressionAttributeValues[":interestTimeline"] = updates.interest.timeline;
    }
  }

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLES.LEADS,
      Key: {
        pk: buildLeadPK(leadId),
        sk: LEAD_METADATA_SK,
      },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes ? itemToLead(result.Attributes as LeadItem) : null;
}

/**
 * Delete a lead
 */
export async function deleteLead(leadId: string): Promise<void> {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLES.LEADS,
      Key: {
        pk: buildLeadPK(leadId),
        sk: LEAD_METADATA_SK,
      },
    })
  );
}

/**
 * Get dashboard stats for leads
 */
export async function getLeadStats(): Promise<{
  total: number;
  hot: number;
  warm: number;
  cold: number;
  new: number;
  contacted: number;
  qualified: number;
  conversionRate: number;
}> {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLES.LEADS,
    })
  );

  const leads = (result.Items || []).map((item) => itemToLead(item as LeadItem));

  const hot = leads.filter((l) => l.priority === "hot").length;
  const warm = leads.filter((l) => l.priority === "warm").length;
  const cold = leads.filter((l) => l.priority === "cold").length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const contacted = leads.filter((l) => l.status === "contacted").length;
  const qualified = leads.filter((l) => l.status === "qualified").length;
  const converted = leads.filter((l) => l.status === "converted").length;

  return {
    total: leads.length,
    hot,
    warm,
    cold,
    new: newLeads,
    contacted,
    qualified,
    conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
  };
}
