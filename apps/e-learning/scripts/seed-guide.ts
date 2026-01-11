/**
 * Seed App Guide for E-Learning
 *
 * This script creates the initial feature showcase content for the e-learning app.
 * The guide is displayed in a carousel when users click the help icon.
 *
 * Usage: bun run scripts/seed-guide.ts
 */

import { putAppGuide, type CreateAppGuideInput } from "@tasco/db";

// English guide content
const ENGLISH_GUIDE: CreateAppGuideInput = {
  appId: "e-learning",
  language: "en",
  appName: "AI E-Learning Factory",
  appTagline: "AI-powered training content generation for insurance professionals",
  ctaText: "Start Learning",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "AI-Powered Training",
      content: "Generate professional training courses using **AI technology**.\n\nTransform your insurance knowledge into engaging learning experiences.",
      highlight: "AI-Powered",
    },
    {
      order: 1,
      icon: "sparkles",
      iconColor: "purple",
      title: "Course Generation",
      content: "Create complete courses from **simple topics**.\n\nAI generates modules, lessons, quizzes, and assessments automatically.",
      highlight: "Auto-Generate",
    },
    {
      order: 2,
      icon: "message",
      iconColor: "blue",
      title: "Ask AI Assistant",
      content: "Get answers to any training-related question.\n\n- Course recommendations\n- Learning path suggestions\n- Content explanations",
    },
    {
      order: 3,
      icon: "database",
      iconColor: "green",
      title: "Course Library",
      content: "Browse our growing library of **insurance training courses**.\n\nFilter by category, difficulty level, and duration.",
      highlight: "100+ Courses",
    },
    {
      order: 4,
      icon: "chart",
      iconColor: "orange",
      title: "Progress Tracking",
      content: "Monitor your learning progress with **detailed analytics**.\n\nTrack completion rates, quiz scores, and time spent.",
      highlight: "Analytics",
    },
    {
      order: 5,
      icon: "check",
      iconColor: "green",
      title: "Certifications",
      content: "Earn **certificates** upon course completion.\n\nProve your insurance expertise with verified credentials.",
      highlight: "Certified",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Bilingual Support",
      content: "Full support for **English** and **Vietnamese**.\n\nLearn in your preferred language.",
    },
  ],
};

// Vietnamese guide content
const VIETNAMESE_GUIDE: CreateAppGuideInput = {
  appId: "e-learning",
  language: "vi",
  appName: "Nhà Máy E-Learning AI",
  appTagline: "Tạo nội dung đào tạo bằng AI cho chuyên gia bảo hiểm",
  ctaText: "Bắt Đầu Học",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "Đào Tạo Bằng AI",
      content: "Tạo khóa học chuyên nghiệp sử dụng **công nghệ AI**.\n\nBiến kiến thức bảo hiểm thành trải nghiệm học tập hấp dẫn.",
      highlight: "AI",
    },
    {
      order: 1,
      icon: "sparkles",
      iconColor: "purple",
      title: "Tạo Khóa Học",
      content: "Tạo khóa học hoàn chỉnh từ **chủ đề đơn giản**.\n\nAI tự động tạo module, bài học, câu hỏi và bài đánh giá.",
      highlight: "Tự Động",
    },
    {
      order: 2,
      icon: "message",
      iconColor: "blue",
      title: "Trợ Lý AI",
      content: "Nhận câu trả lời cho mọi câu hỏi về đào tạo.\n\n- Đề xuất khóa học\n- Gợi ý lộ trình học\n- Giải thích nội dung",
    },
    {
      order: 3,
      icon: "database",
      iconColor: "green",
      title: "Thư Viện Khóa Học",
      content: "Duyệt thư viện **khóa học bảo hiểm** đang phát triển.\n\nLọc theo danh mục, mức độ và thời lượng.",
      highlight: "100+ Khóa",
    },
    {
      order: 4,
      icon: "chart",
      iconColor: "orange",
      title: "Theo Dõi Tiến Độ",
      content: "Theo dõi tiến trình học với **phân tích chi tiết**.\n\nXem tỷ lệ hoàn thành, điểm bài kiểm tra và thời gian học.",
      highlight: "Phân Tích",
    },
    {
      order: 5,
      icon: "check",
      iconColor: "green",
      title: "Chứng Chỉ",
      content: "Nhận **chứng chỉ** khi hoàn thành khóa học.\n\nChứng minh chuyên môn bảo hiểm với chứng nhận xác thực.",
      highlight: "Chứng Nhận",
    },
    {
      order: 6,
      icon: "globe",
      iconColor: "cyan",
      title: "Hỗ Trợ Song Ngữ",
      content: "Hỗ trợ đầy đủ cho **Tiếng Anh** và **Tiếng Việt**.\n\nHọc bằng ngôn ngữ bạn thích.",
    },
  ],
};

async function seedGuides() {
  console.log("=".repeat(50));
  console.log("SEEDING APP GUIDES FOR E-LEARNING");
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
