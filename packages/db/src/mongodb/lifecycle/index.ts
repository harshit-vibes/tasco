/**
 * MongoDB Lifecycle Module Exports
 *
 * This module provides MongoDB operations for the customer-lifecycle app,
 * as part of the migration from DynamoDB.
 */

// Type exports
export type {
  // Lead types
  LeadDocument,
  Lead,
  CreateLeadInput,
  UpdateLeadInput,
  LeadStats,
  LeadSource,
  LeadStatus,
  LeadPriority,
  AILeadScore,
  // Customer types
  CustomerDocument,
  Customer,
  CreateCustomerInput,
  UpdateCustomerInput,
  CustomerStage,
  CustomerSegment,
  // Campaign types
  CampaignDocument,
  Campaign,
  CreateCampaignInput,
  UpdateCampaignInput,
  CampaignType,
  CampaignStatus,
  // Vehicle types
  VehicleDocument,
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleStats,
  VehicleBrand,
  VehicleStatus,
  AgeAlert,
  // Import Order types
  ImportOrderDocument,
  ImportOrder,
  CreateImportOrderInput,
  UpdateImportOrderInput,
  VehicleOrderLine,
  OrderStatus,
  // Entity types
  EntityDocument,
  Entity,
  CreateEntityInput,
  // Utility types
  PaginatedResult,
} from "./types";

// Lead operations
export {
  createLead,
  getLeadById,
  getAllLeads,
  getLeadsByEntity,
  getLeadsByEntities,
  getLeadsByPriority,
  getLeadsByStatus,
  updateLead,
  deleteLead,
  getLeadStats,
  searchLeads,
  getHotLeads,
  getLeadsCountByEntity,
  bulkCreateLeads,
} from "./leads";

// Customer operations
export {
  createCustomer,
  getCustomerById,
  getAllCustomers,
  getCustomersByEntity,
  getCustomersByEntities,
  getCustomersBySegment,
  getCustomersByStage,
  getAtRiskCustomers,
  getVIPCustomers,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  getCustomerStats,
  bulkCreateCustomers,
} from "./customers";

// Campaign operations
export {
  createCampaign,
  getCampaignById,
  getAllCampaigns,
  getCampaignsByEntity,
  getCampaignsByEntities,
  getCampaignsByStatus,
  getCampaignsByType,
  getActiveCampaigns,
  updateCampaign,
  deleteCampaign,
  getCampaignStats,
  incrementCampaignMetric,
} from "./campaigns";

// Vehicle operations
export {
  createVehicle,
  getVehicleById,
  getVehicleByVin,
  getAllVehicles,
  getVehiclesByEntity,
  getVehiclesByEntities,
  getVehiclesByStatus,
  getVehiclesByBrand,
  getInStockVehicles,
  getAgingVehicles,
  updateVehicle,
  deleteVehicle,
  getVehicleStats,
} from "./vehicles";

// Import Order operations
export {
  createImportOrder,
  getImportOrderById,
  getAllImportOrders,
  getImportOrdersByEntity,
  getImportOrdersByEntities,
  getImportOrdersByStatus,
  updateImportOrder,
  deleteImportOrder,
} from "./vehicles";

// Entity operations
export {
  createEntity,
  getEntityById,
  listEntities,
  listEntitiesByCategory,
  listEntitiesByType,
  getEntitiesByParent,
  updateEntity,
  deleteEntity,
  isEntitiesEmpty,
  batchCreateEntities,
  searchEntities,
  getEntityCount,
  getEntityHierarchy,
} from "./entities";
