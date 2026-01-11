/**
 * Seed DynamoDB with User demo data
 *
 * Usage:
 *   bun run db:seed-users
 *
 * This script populates the users table with demo data for Tasco Auto
 */

import { createUser } from "../users";
import type { CreateUserInput } from "../users";

console.log("\n=== Seeding User Data ===\n");

// Sample users for Tasco Auto business unit
const users: CreateUserInput[] = [
  {
    userId: "user-001",
    email: "tran.mai@tasco-auto.vn",
    fullName: "Trần Mai",
    firstName: "Mai",
    lastName: "Trần",
    role: "manager",
    entityId: "tasco-auto",
    phoneNumber: "+84 90 111 2222",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2020-03-15",
      performanceMetrics: {
        leadsConverted: 145,
        totalSales: 12500000000,
        averageResponseTime: 24,
      },
    },
  },
  {
    userId: "user-002",
    email: "pham.nam@tasco-auto.vn",
    fullName: "Phạm Văn Nam",
    firstName: "Nam",
    lastName: "Phạm Văn",
    role: "sales_rep",
    entityId: "tasco-auto",
    phoneNumber: "+84 91 222 3333",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2021-07-20",
      performanceMetrics: {
        leadsConverted: 89,
        totalSales: 6800000000,
        averageResponseTime: 18,
      },
    },
  },
  {
    userId: "user-003",
    email: "nguyen.linh@tasco-auto.vn",
    fullName: "Nguyễn Thị Linh",
    firstName: "Linh",
    lastName: "Nguyễn Thị",
    role: "sales_rep",
    entityId: "tasco-auto",
    phoneNumber: "+84 92 333 4444",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2022-01-10",
      performanceMetrics: {
        leadsConverted: 67,
        totalSales: 5200000000,
        averageResponseTime: 22,
      },
    },
  },
  {
    userId: "user-004",
    email: "le.duc@tasco-auto.vn",
    fullName: "Lê Minh Đức",
    firstName: "Đức",
    lastName: "Lê Minh",
    role: "sales_rep",
    entityId: "tasco-auto",
    phoneNumber: "+84 93 444 5555",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2021-11-05",
      performanceMetrics: {
        leadsConverted: 72,
        totalSales: 5900000000,
        averageResponseTime: 20,
      },
    },
  },
  {
    userId: "user-005",
    email: "vo.anh@tasco-auto.vn",
    fullName: "Võ Thị Ánh",
    firstName: "Ánh",
    lastName: "Võ Thị",
    role: "sales_rep",
    entityId: "tasco-auto",
    phoneNumber: "+84 94 555 6666",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2023-02-14",
      performanceMetrics: {
        leadsConverted: 34,
        totalSales: 2800000000,
        averageResponseTime: 26,
      },
    },
  },
  {
    userId: "user-006",
    email: "hoang.khanh@tasco-auto.vn",
    fullName: "Hoàng Văn Khánh",
    firstName: "Khánh",
    lastName: "Hoàng Văn",
    role: "support",
    entityId: "tasco-auto",
    phoneNumber: "+84 95 666 7777",
    isActive: true,
    metadata: {
      department: "Customer Service",
      hireDate: "2020-09-01",
    },
  },
  {
    userId: "user-007",
    email: "bui.admin@tasco-auto.vn",
    fullName: "Bùi Thanh Tùng",
    firstName: "Tùng",
    lastName: "Bùi Thanh",
    role: "admin",
    entityId: "tasco-auto",
    phoneNumber: "+84 96 777 8888",
    isActive: true,
    metadata: {
      department: "IT & Operations",
      hireDate: "2019-05-10",
    },
  },
  // Users for Carpla (subsidiary of Tasco Auto)
  {
    userId: "user-008",
    email: "tran.hung@carpla.vn",
    fullName: "Trần Quang Hùng",
    firstName: "Hùng",
    lastName: "Trần Quang",
    role: "manager",
    entityId: "carpla",
    phoneNumber: "+84 97 888 9999",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2021-03-20",
      performanceMetrics: {
        leadsConverted: 58,
        totalSales: 3200000000,
        averageResponseTime: 16,
      },
    },
  },
  {
    userId: "user-009",
    email: "pham.thu@carpla.vn",
    fullName: "Phạm Thu Hương",
    firstName: "Hương",
    lastName: "Phạm Thu",
    role: "sales_rep",
    entityId: "carpla",
    phoneNumber: "+84 98 999 0000",
    isActive: true,
    metadata: {
      department: "Sales",
      hireDate: "2022-06-15",
      performanceMetrics: {
        leadsConverted: 41,
        totalSales: 2100000000,
        averageResponseTime: 19,
      },
    },
  },
];

async function seedUsers() {
  try {
    console.log("Seeding users...");

    for (const user of users) {
      const created = await createUser(user);
      console.log(`  ✓ Created user: ${created.fullName} (${created.role})`);
    }

    console.log("\n=== ✅ All users seeded successfully ===\n");
    console.log(`Total users created: ${users.length}`);
    console.log(
      `  - Managers: ${users.filter((u) => u.role === "manager").length}`
    );
    console.log(
      `  - Sales Reps: ${users.filter((u) => u.role === "sales_rep").length}`
    );
    console.log(
      `  - Support: ${users.filter((u) => u.role === "support").length}`
    );
    console.log(
      `  - Admins: ${users.filter((u) => u.role === "admin").length}`
    );
    console.log();
  } catch (error) {
    console.error("\n❌ Error seeding users:", error);
    process.exit(1);
  }
}

seedUsers();
