/**
 * Seed mock sales orders to DynamoDB
 * Generates diverse orders with realistic Vietnamese data
 */

import { BatchWriteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "../client";
import type { Order } from "../sales-orders/types";

// Vietnamese customer names
const CUSTOMER_NAMES = [
  "Công ty TNHH Thương mại Hải Đăng",
  "Công ty CP Dược phẩm Việt Nam",
  "Công ty TNHH MTV Thực phẩm Hà Nội",
  "Công ty CP Công nghệ Tin học FPT",
  "Công ty TNHH Điện tử Samsung Việt Nam",
  "Công ty CP May Việt Tiến",
  "Công ty TNHH Xây dựng Coteccons",
  "Công ty CP Thép Hòa Phát",
  "Công ty TNHH Nông nghiệp Đà Lạt",
  "Công ty CP Dệt may Việt Nam",
  "Công ty TNHH Thực phẩm Nutifood",
  "Công ty CP Vinamilk",
  "Công ty TNHH Trung Nguyên Legend",
  "Công ty CP Tập đoàn Masan",
  "Công ty TNHH Kỹ thuật Điện Việt",
];

// Product catalog
const PRODUCTS = [
  { code: "SP001", name: "Bia Tiger lon 330ml", price: 12000, unit: "thùng" },
  { code: "SP002", name: "Nước ngọt Coca Cola 1.5L", price: 15000, unit: "thùng" },
  { code: "SP003", name: "Sữa tươi TH True Milk", price: 45000, unit: "thùng" },
  { code: "SP004", name: "Mì gói Hảo Hảo", price: 89000, unit: "thùng" },
  { code: "SP005", name: "Nước suối Lavie 500ml", price: 48000, unit: "thùng" },
  { code: "SP006", name: "Bia Heineken lon 330ml", price: 18000, unit: "thùng" },
  { code: "SP007", name: "Nước tăng lực Red Bull", price: 120000, unit: "thùng" },
  { code: "SP008", name: "Sữa đặc Ông Thọ", price: 85000, unit: "thùng" },
  { code: "SP009", name: "Cà phê Trung Nguyên G7", price: 165000, unit: "hộp" },
  { code: "SP010", name: "Nước mắm Nam Ngư", price: 95000, unit: "thùng" },
  { code: "SP011", name: "Tương ớt Chinsu", price: 78000, unit: "thùng" },
  { code: "SP012", name: "Dầu ăn Simply", price: 125000, unit: "thùng" },
];

// Team members
const TEAM_MEMBERS = [
  "nguyen.van.a@inochi.vn",
  "tran.thi.b@inochi.vn",
  "le.van.c@inochi.vn",
  "pham.thi.d@inochi.vn",
  "hoang.van.e@inochi.vn",
];

// Tags for categorization
const TAGS_POOL = [
  ["priority", "large-order"],
  ["urgent", "vip-customer"],
  ["standard"],
  ["bulk-order", "discount"],
  ["new-customer"],
  ["regular-customer"],
  ["high-value"],
  ["rush-delivery"],
];

// Helper functions
function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomConfidence(): number {
  const rand = Math.random();
  if (rand < 0.5) return randomInt(90, 99); // 50% high confidence
  if (rand < 0.85) return randomInt(75, 89); // 35% medium confidence
  return randomInt(60, 74); // 15% low confidence
}

function generateCustomerCode(name: string): string {
  const words = name.split(" ");
  const initials = words
    .filter(w => w !== "Công" && w !== "ty" && w !== "TNHH" && w !== "CP" && w !== "MTV")
    .map(w => w[0])
    .join("")
    .toUpperCase();
  return `KH${initials}${randomInt(100, 999)}`;
}

function generateOrderDate(): string {
  const now = new Date();
  const daysAgo = randomInt(0, 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return date.toISOString().split("T")[0];
}

function generateDeliveryDate(orderDate: string): string {
  const date = new Date(orderDate);
  const daysLater = randomInt(3, 10);
  date.setDate(date.getDate() + daysLater);
  return date.toISOString().split("T")[0];
}

function generateOrderItems(): Array<{
  id: string;
  productCode: { value: string; confidence: number };
  productName: { value: string; confidence: number };
  quantity: { value: number; confidence: number };
  unit: { value: string; confidence: number };
  unitPrice: { value: number; confidence: number };
  amount: number;
}> {
  const itemCount = randomInt(2, 8);
  const items = [];

  for (let i = 0; i < itemCount; i++) {
    const product = randomItem(PRODUCTS);
    const quantity = randomInt(10, 100);
    const amount = quantity * product.price;

    items.push({
      id: `item-${Date.now()}-${i}`,
      productCode: { value: product.code, confidence: randomConfidence() },
      productName: { value: product.name, confidence: randomConfidence() },
      quantity: { value: quantity, confidence: randomConfidence() },
      unit: { value: product.unit, confidence: randomConfidence() },
      unitPrice: { value: product.price, confidence: randomConfidence() },
      amount,
    });
  }

  return items;
}

function generateOrder(index: number): Order {
  const customerName = randomItem(CUSTOMER_NAMES);
  const customerCode = generateCustomerCode(customerName);
  const orderDate = generateOrderDate();
  const deliveryDate = generateDeliveryDate(orderDate);
  const items = generateOrderItems();
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const confidence = randomConfidence();
  const createdAt = new Date(new Date(orderDate).getTime() + randomInt(0, 86400000)).toISOString();

  // Determine status based on age and randomness
  const daysOld = Math.floor((Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24));
  let status: Order["status"];
  let reviewedBy: string | undefined;
  let reviewedAt: string | undefined;
  let exportedBy: string | undefined;
  let exportedAt: string | undefined;
  let assignedTo: string | undefined;
  let assignedAt: string | undefined;

  const rand = Math.random();

  if (daysOld < 2 && rand < 0.4) {
    // Recent orders more likely to be reviewing
    status = "reviewing";
    assignedTo = randomItem(TEAM_MEMBERS);
    assignedAt = new Date(new Date(createdAt).getTime() + 3600000).toISOString();
  } else if (rand < 0.3) {
    status = "reviewing";
    assignedTo = randomItem(TEAM_MEMBERS);
    assignedAt = new Date(new Date(createdAt).getTime() + 3600000).toISOString();
  } else if (rand < 0.6) {
    status = "approved";
    reviewedBy = randomItem(TEAM_MEMBERS);
    reviewedAt = new Date(new Date(createdAt).getTime() + 7200000).toISOString();
  } else if (rand < 0.85) {
    status = "exported";
    reviewedBy = randomItem(TEAM_MEMBERS);
    reviewedAt = new Date(new Date(createdAt).getTime() + 7200000).toISOString();
    exportedBy = reviewedBy;
    exportedAt = new Date(new Date(reviewedAt).getTime() + 1800000).toISOString();
  } else {
    status = "rejected";
    reviewedBy = randomItem(TEAM_MEMBERS);
    reviewedAt = new Date(new Date(createdAt).getTime() + 7200000).toISOString();
  }

  // Add tags based on order characteristics
  const tags: string[] = [];
  if (totalAmount > 5000000) tags.push("high-value");
  if (items.length > 6) tags.push("large-order");
  if (confidence < 80) tags.push("needs-review");
  if (status === "reviewing" && daysOld < 1) tags.push("urgent");

  // Add random tags
  if (Math.random() < 0.3) {
    tags.push(...randomItem(TAGS_POOL));
  }

  // Generate internal notes for some orders
  const internalNotes = Math.random() < 0.3
    ? [
        "Khách hàng yêu cầu giao hàng sớm",
        "Đã xác nhận lại số lượng với khách",
        "Cần kiểm tra giá trước khi xuất",
        "Khách VIP - ưu tiên xử lý",
        "Đơn hàng thường xuyên",
      ][randomInt(0, 4)]
    : undefined;

  const order: Order = {
    orderId: `ORD${String(index + 1).padStart(4, "0")}-${Date.now().toString().slice(-6)}`,
    entityId: "inochi",
    status,
    sourceType: randomItem(["pdf", "image"] as const),
    sourceUrl: `https://tasco-documents.s3.ap-southeast-1.amazonaws.com/mock/order-${index + 1}.pdf`,
    fileName: `order-${customerCode}-${orderDate}.pdf`,
    fileSize: randomInt(50000, 500000),
    confidence,
    extractedData: {
      customerName: { value: customerName, confidence: randomConfidence() },
      customerCode: { value: customerCode, confidence: randomConfidence() },
      orderDate: { value: orderDate, confidence: randomConfidence() },
      deliveryDate: { value: deliveryDate, confidence: randomConfidence() },
      items,
      totalAmount,
      notes: {
        value: Math.random() < 0.5
          ? "Giao hàng trong giờ hành chính"
          : "Liên hệ trước khi giao",
        confidence: randomConfidence()
      },
    },
    processingTime: {
      ocrMs: randomInt(500, 2000),
      extractionMs: randomInt(1000, 3000),
      validationMs: randomInt(500, 1500),
      totalMs: randomInt(2000, 6500),
    },
    createdAt,
    updatedAt: reviewedAt || createdAt,
    createdBy: "system",
    reviewedBy,
    reviewedAt,
    exportedAt,
    exportedBy,
    assignedTo,
    assignedAt,
    tags: tags.length > 0 ? tags : undefined,
    internalNotes,
    extractionAgentId: "69613126c57d451439d4c4e4",
    validationAgentId: Math.random() < 0.7 ? "69613126c57d451439d4c4e5" : undefined,
  };

  return order;
}

async function seedOrders(count: number = 50) {
  console.log(`\n🌱 Seeding ${count} sales orders to DynamoDB...\n`);

  const orders: Order[] = [];

  for (let i = 0; i < count; i++) {
    orders.push(generateOrder(i));
  }

  // Write orders to DynamoDB in batches of 25
  const batchSize = 25;
  for (let i = 0; i < orders.length; i += batchSize) {
    const batch = orders.slice(i, i + batchSize);

    const requests = batch.map(order => ({
      PutRequest: {
        Item: order,
      },
    }));

    try {
      await docClient.send(
        new BatchWriteCommand({
          RequestItems: {
            "tasco-sales-orders": requests,
          },
        })
      );

      console.log(`✅ Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(orders.length / batchSize)} - ${batch.length} orders written`);
    } catch (error) {
      console.error(`❌ Failed to write batch ${Math.floor(i / batchSize) + 1}:`, error);
    }
  }

  // Print summary
  const summary = {
    total: orders.length,
    reviewing: orders.filter(o => o.status === "reviewing").length,
    approved: orders.filter(o => o.status === "approved").length,
    exported: orders.filter(o => o.status === "exported").length,
    rejected: orders.filter(o => o.status === "rejected").length,
    highConfidence: orders.filter(o => o.confidence >= 90).length,
    mediumConfidence: orders.filter(o => o.confidence >= 75 && o.confidence < 90).length,
    lowConfidence: orders.filter(o => o.confidence < 75).length,
    assigned: orders.filter(o => o.assignedTo).length,
    tagged: orders.filter(o => o.tags && o.tags.length > 0).length,
    withNotes: orders.filter(o => o.internalNotes).length,
  };

  console.log("\n📊 Seeding Summary:");
  console.log(`   Total orders: ${summary.total}`);
  console.log(`   Status breakdown:`);
  console.log(`     - Reviewing: ${summary.reviewing}`);
  console.log(`     - Approved: ${summary.approved}`);
  console.log(`     - Exported: ${summary.exported}`);
  console.log(`     - Rejected: ${summary.rejected}`);
  console.log(`   Confidence breakdown:`);
  console.log(`     - High (≥90%): ${summary.highConfidence}`);
  console.log(`     - Medium (75-89%): ${summary.mediumConfidence}`);
  console.log(`     - Low (<75%): ${summary.lowConfidence}`);
  console.log(`   Features:`);
  console.log(`     - Assigned: ${summary.assigned}`);
  console.log(`     - Tagged: ${summary.tagged}`);
  console.log(`     - With notes: ${summary.withNotes}`);
  console.log("\n✨ Seeding complete!\n");
}

// Run if called directly
if (require.main === module) {
  const count = process.argv[2] ? parseInt(process.argv[2], 10) : 50;
  seedOrders(count).catch(console.error);
}

export { seedOrders };
