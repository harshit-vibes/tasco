/**
 * Seed App Guide for Compliance QA
 *
 * This script creates the initial feature showcase content for the compliance-qa app.
 * The guide is displayed in a carousel when users click the help icon.
 *
 * Usage: bun run scripts/seed-guide.ts
 */

import { putAppGuide, type CreateAppGuideInput } from "@tasco/db";

// English guide content
const ENGLISH_GUIDE: CreateAppGuideInput = {
  appId: "compliance-qa",
  language: "en",
  appName: "Compliance Super AI",
  appTagline: "AI-powered compliance document governance",
  ctaText: "Start Asking",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "AI-Powered Compliance",
      content: "Ask complex compliance questions in **natural language**.\n\nGet instant answers backed by your actual policy documents.",
      highlight: "AI-Powered",
    },
    {
      order: 1,
      icon: "message",
      iconColor: "blue",
      title: "Smart Q&A",
      content: "Simply type your compliance questions.\n\nThe AI searches through your documents and provides **accurate answers with citations**.",
    },
    {
      order: 2,
      icon: "database",
      iconColor: "green",
      title: "Knowledge Base",
      content: "Upload and manage your compliance documents.\n\n- Policies & procedures\n- Legal regulations\n- Corporate charters\n- Meeting minutes",
      highlight: "RAG-Powered",
    },
    {
      order: 3,
      icon: "file",
      iconColor: "orange",
      title: "Document Citations",
      content: "Every answer includes **clickable citations**.\n\nClick to view the exact source with relevant sections highlighted.",
      highlight: "Traceable",
    },
    {
      order: 4,
      icon: "check",
      iconColor: "green",
      title: "Response Validation",
      content: "AI responses are **automatically validated** for accuracy.\n\nConfidence scores help you trust the answers.",
      highlight: "Validated",
    },
    {
      order: 5,
      icon: "users",
      iconColor: "purple",
      title: "Multi-Entity Support",
      content: "Query documents across **17 Tasco subsidiaries**.\n\nFilter by entity or search group-wide.",
      highlight: "Enterprise",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Bilingual Support",
      content: "Full support for **English** and **Vietnamese**.\n\nAsk questions and view documents in either language.",
    },
  ],
};

// Vietnamese guide content
const VIETNAMESE_GUIDE: CreateAppGuideInput = {
  appId: "compliance-qa",
  language: "vi",
  appName: "Trợ Lý Tuân Thủ AI",
  appTagline: "Quản trị tài liệu tuân thủ bằng AI",
  ctaText: "Bắt Đầu Hỏi",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "Tuân Thủ Bằng AI",
      content: "Đặt câu hỏi tuân thủ phức tạp bằng **ngôn ngữ tự nhiên**.\n\nNhận câu trả lời ngay lập tức dựa trên tài liệu chính sách thực tế của bạn.",
      highlight: "AI",
    },
    {
      order: 1,
      icon: "message",
      iconColor: "blue",
      title: "Hỏi Đáp Thông Minh",
      content: "Chỉ cần gõ câu hỏi tuân thủ của bạn.\n\nAI tìm kiếm qua các tài liệu và cung cấp **câu trả lời chính xác với trích dẫn**.",
    },
    {
      order: 2,
      icon: "database",
      iconColor: "green",
      title: "Kho Kiến Thức",
      content: "Tải lên và quản lý tài liệu tuân thủ.\n\n- Chính sách & thủ tục\n- Quy định pháp luật\n- Điều lệ công ty\n- Biên bản họp",
      highlight: "RAG",
    },
    {
      order: 3,
      icon: "file",
      iconColor: "orange",
      title: "Trích Dẫn Tài Liệu",
      content: "Mọi câu trả lời đều có **trích dẫn có thể nhấp**.\n\nNhấp để xem nguồn chính xác với các phần liên quan được đánh dấu.",
      highlight: "Truy Xuất",
    },
    {
      order: 4,
      icon: "check",
      iconColor: "green",
      title: "Xác Thực Phản Hồi",
      content: "Các phản hồi AI được **tự động xác thực** độ chính xác.\n\nĐiểm tin cậy giúp bạn tin tưởng câu trả lời.",
      highlight: "Xác Thực",
    },
    {
      order: 5,
      icon: "users",
      iconColor: "purple",
      title: "Hỗ Trợ Đa Thực Thể",
      content: "Truy vấn tài liệu từ **17 công ty con Tasco**.\n\nLọc theo thực thể hoặc tìm kiếm toàn tập đoàn.",
      highlight: "Doanh Nghiệp",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Hỗ Trợ Song Ngữ",
      content: "Hỗ trợ đầy đủ cho **Tiếng Anh** và **Tiếng Việt**.\n\nĐặt câu hỏi và xem tài liệu bằng cả hai ngôn ngữ.",
    },
  ],
};

async function seedGuides() {
  console.log("=".repeat(50));
  console.log("SEEDING APP GUIDES FOR COMPLIANCE-QA");
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
