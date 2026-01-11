/**
 * Seed App Guide for Customer Lifecycle
 *
 * This script creates the initial feature showcase content for the customer-lifecycle app.
 * The guide is displayed in a carousel when users click the help icon.
 *
 * Usage: bun run scripts/seed-guide.ts
 */

import { putAppGuide, type CreateAppGuideInput } from "@tasco/db";

// English guide content
const ENGLISH_GUIDE: CreateAppGuideInput = {
  appId: "customer-lifecycle",
  language: "en",
  appName: "Customer Lifecycle AI",
  appTagline: "AI-powered customer management for automotive sales",
  ctaText: "Get Started",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "users",
      iconColor: "primary",
      title: "Customer Lifecycle Management",
      content: "Manage your entire customer journey with **AI-powered insights**.\n\nFrom leads to loyal customers, optimize every touchpoint.",
      highlight: "AI-Powered",
    },
    {
      order: 1,
      icon: "sparkles",
      iconColor: "blue",
      title: "Lead Prioritization",
      content: "AI scores and prioritizes your leads automatically.\n\nFocus on **high-value prospects** with the best conversion potential.",
      highlight: "Smart Scoring",
    },
    {
      order: 2,
      icon: "message",
      iconColor: "green",
      title: "AI Assistant",
      content: "Ask questions about your customers:\n\n- Lead recommendations\n- Churn risk analysis\n- Campaign performance\n- Customer insights",
    },
    {
      order: 3,
      icon: "chart",
      iconColor: "orange",
      title: "Analytics Dashboard",
      content: "Visualize customer metrics at a glance.\n\n- Conversion funnels\n- Revenue tracking\n- Campaign ROI\n- Customer segments",
      highlight: "Real-time",
    },
    {
      order: 4,
      icon: "shield",
      iconColor: "red",
      title: "Churn Prevention",
      content: "Identify customers **at risk of churning**.\n\nGet proactive recommendations to retain valuable customers.",
      highlight: "Risk Alerts",
    },
    {
      order: 5,
      icon: "zap",
      iconColor: "purple",
      title: "Next Best Action",
      content: "AI recommends the **optimal next step** for each customer.\n\nImprove engagement and close more deals.",
      highlight: "Smart Actions",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Multi-Showroom Support",
      content: "Manage customers across **all Tasco Auto showrooms**.\n\nUnified view with location-specific filtering.",
    },
  ],
};

// Vietnamese guide content
const VIETNAMESE_GUIDE: CreateAppGuideInput = {
  appId: "customer-lifecycle",
  language: "vi",
  appName: "Customer Lifecycle AI",
  appTagline: "Quản lý khách hàng bằng AI cho bán hàng ô tô",
  ctaText: "Bắt Đầu",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "users",
      iconColor: "primary",
      title: "Quản Lý Vòng Đời Khách Hàng",
      content: "Quản lý toàn bộ hành trình khách hàng với **insights bằng AI**.\n\nTừ leads đến khách hàng trung thành, tối ưu hóa mọi điểm chạm.",
      highlight: "AI",
    },
    {
      order: 1,
      icon: "sparkles",
      iconColor: "blue",
      title: "Ưu Tiên Lead",
      content: "AI tự động chấm điểm và ưu tiên leads.\n\nTập trung vào **khách hàng tiềm năng cao** với khả năng chuyển đổi tốt nhất.",
      highlight: "Chấm Điểm",
    },
    {
      order: 2,
      icon: "message",
      iconColor: "green",
      title: "Trợ Lý AI",
      content: "Hỏi về khách hàng của bạn:\n\n- Đề xuất lead\n- Phân tích rủi ro rời bỏ\n- Hiệu suất chiến dịch\n- Insights khách hàng",
    },
    {
      order: 3,
      icon: "chart",
      iconColor: "orange",
      title: "Bảng Điều Khiển Phân Tích",
      content: "Trực quan hóa chỉ số khách hàng trong nháy mắt.\n\n- Phễu chuyển đổi\n- Theo dõi doanh thu\n- ROI chiến dịch\n- Phân khúc khách hàng",
      highlight: "Thời Gian Thực",
    },
    {
      order: 4,
      icon: "shield",
      iconColor: "red",
      title: "Ngăn Ngừa Rời Bỏ",
      content: "Xác định khách hàng **có nguy cơ rời bỏ**.\n\nNhận đề xuất chủ động để giữ chân khách hàng giá trị.",
      highlight: "Cảnh Báo",
    },
    {
      order: 5,
      icon: "zap",
      iconColor: "purple",
      title: "Hành Động Tiếp Theo Tốt Nhất",
      content: "AI đề xuất **bước tối ưu tiếp theo** cho mỗi khách hàng.\n\nCải thiện tương tác và chốt nhiều giao dịch hơn.",
      highlight: "Thông Minh",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Hỗ Trợ Đa Showroom",
      content: "Quản lý khách hàng trên **tất cả showroom Tasco Auto**.\n\nGiao diện thống nhất với bộ lọc theo địa điểm.",
    },
  ],
};

async function seedGuides() {
  console.log("=".repeat(50));
  console.log("SEEDING APP GUIDES FOR CUSTOMER-LIFECYCLE");
  console.log("=".repeat(50));

  try {
    // Seed English guide
    console.log("\n📝 Creating English guide...");
    const enGuide = await putAppGuide(ENGLISH_GUIDE);
    console.log(`   ✅ Created: ${enGuide.id}`);
    console.log(`   📊 Slides: ${enGuide.slides.length}`);

    // Seed Vietnamese guide
    console.log("\n📝 Creating Vietnamese guide...");
    const viGuide = await putAppGuide(VIETNAMESE_GUIDE);
    console.log(`   ✅ Created: ${viGuide.id}`);
    console.log(`   📊 Slides: ${viGuide.slides.length}`);

    console.log("\n" + "=".repeat(50));
    console.log("✅ GUIDE SEEDING COMPLETE");
    console.log("=".repeat(50));
    console.log("\nGuides created:");
    console.log(`  - English (en): ${ENGLISH_GUIDE.slides.length} slides`);
    console.log(`  - Vietnamese (vi): ${VIETNAMESE_GUIDE.slides.length} slides`);
  } catch (error) {
    console.error("\n❌ Error seeding guides:", error);
    process.exit(1);
  }
}

// Run the seeder
seedGuides();
