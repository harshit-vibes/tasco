/**
 * Seed App Guide for Sales Order
 *
 * This script creates the initial feature showcase content for the sales-order app.
 * The guide is displayed in a carousel when users click the help icon.
 *
 * Usage: bun run seed-guide
 */

import { putAppGuide, type CreateAppGuideInput } from "@tasco/db";

// English guide content
const ENGLISH_GUIDE: CreateAppGuideInput = {
  appId: "sales-order",
  language: "en",
  appName: "Sales Order AI",
  appTagline: "AI-powered order data entry automation",
  ctaText: "Start Uploading",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "AI-Powered Extraction",
      content: "Upload order documents and let AI **extract structured data** automatically.\n\nNo more manual data entry - save hours of work daily.",
      highlight: "AI-Powered",
    },
    {
      order: 1,
      icon: "file",
      iconColor: "blue",
      title: "Vietnamese OCR",
      content: "Advanced OCR technology optimized for **Vietnamese documents**.\n\nAccurately reads printed and handwritten Vietnamese text.",
      highlight: "Vietnamese",
    },
    {
      order: 2,
      icon: "check",
      iconColor: "green",
      title: "Confidence Scoring",
      content: "Every extracted field has a **confidence score**.\n\n- Green: High confidence (90%+)\n- Yellow: Medium (70-89%)\n- Red: Needs review (<70%)",
      highlight: "Quality",
    },
    {
      order: 3,
      icon: "search",
      iconColor: "orange",
      title: "Split-Screen Review",
      content: "Review extracted data **side-by-side** with source documents.\n\nZoom, rotate, and navigate PDFs while editing.",
      highlight: "Efficient",
    },
    {
      order: 4,
      icon: "shield",
      iconColor: "purple",
      title: "AI Validation",
      content: "Extracted data is **automatically validated** for:\n\n- Business logic (calculations)\n- Date consistency\n- Required fields",
      highlight: "Validated",
    },
    {
      order: 5,
      icon: "users",
      iconColor: "cyan",
      title: "Team Collaboration",
      content: "Assign orders to team members.\n\nAdd **tags** and **internal notes** for seamless handoffs.",
      highlight: "Teamwork",
    },
    {
      order: 6,
      icon: "zap",
      iconColor: "green",
      title: "Bravo ERP Export",
      content: "One-click export to **Bravo ERP format**.\n\nGenerate Excel files ready for import into your ERP system.",
      highlight: "Export",
    },
  ],
};

// Vietnamese guide content
const VIETNAMESE_GUIDE: CreateAppGuideInput = {
  appId: "sales-order",
  language: "vi",
  appName: "Đơn Hàng AI",
  appTagline: "Tự động hóa nhập liệu đơn hàng bằng AI",
  ctaText: "Bắt Đầu Tải Lên",
  enabled: true,
  slides: [
    {
      order: 0,
      icon: "brain",
      iconColor: "primary",
      title: "Trích Xuất Bằng AI",
      content: "Tải lên tài liệu đơn hàng và để AI **tự động trích xuất dữ liệu**.\n\nKhông cần nhập liệu thủ công - tiết kiệm hàng giờ mỗi ngày.",
      highlight: "AI",
    },
    {
      order: 1,
      icon: "file",
      iconColor: "blue",
      title: "OCR Tiếng Việt",
      content: "Công nghệ OCR tiên tiến tối ưu cho **tài liệu tiếng Việt**.\n\nĐọc chính xác văn bản in và viết tay tiếng Việt.",
      highlight: "Tiếng Việt",
    },
    {
      order: 2,
      icon: "check",
      iconColor: "green",
      title: "Điểm Tin Cậy",
      content: "Mỗi trường được trích xuất có **điểm tin cậy**.\n\n- Xanh lá: Cao (90%+)\n- Vàng: Trung bình (70-89%)\n- Đỏ: Cần xem xét (<70%)",
      highlight: "Chất Lượng",
    },
    {
      order: 3,
      icon: "search",
      iconColor: "orange",
      title: "Xem Xét Song Song",
      content: "Xem xét dữ liệu trích xuất **cạnh bên** tài liệu gốc.\n\nPhóng to, xoay và điều hướng PDF trong khi chỉnh sửa.",
      highlight: "Hiệu Quả",
    },
    {
      order: 4,
      icon: "shield",
      iconColor: "purple",
      title: "Xác Thực AI",
      content: "Dữ liệu trích xuất được **tự động xác thực** cho:\n\n- Logic nghiệp vụ (tính toán)\n- Nhất quán ngày tháng\n- Các trường bắt buộc",
      highlight: "Xác Thực",
    },
    {
      order: 5,
      icon: "users",
      iconColor: "cyan",
      title: "Làm Việc Nhóm",
      content: "Phân công đơn hàng cho thành viên nhóm.\n\nThêm **nhãn** và **ghi chú nội bộ** để bàn giao liền mạch.",
      highlight: "Nhóm",
    },
    {
      order: 6,
      icon: "zap",
      iconColor: "green",
      title: "Xuất Bravo ERP",
      content: "Xuất một cú nhấp sang **định dạng Bravo ERP**.\n\nTạo file Excel sẵn sàng nhập vào hệ thống ERP của bạn.",
      highlight: "Xuất",
    },
  ],
};

async function seedGuides() {
  console.log("=".repeat(50));
  console.log("SEEDING APP GUIDES FOR SALES-ORDER");
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
