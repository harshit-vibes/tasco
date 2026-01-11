import { NextRequest, NextResponse } from "next/server";

// Risk Radar Feature Guide - Localized content
const guides = {
  en: {
    id: "risk-radar-guide-en",
    appId: "risk-radar",
    language: "en",
    appName: "Risk Radar",
    appTagline: "AI-Powered Risk Intelligence for Insurance",
    slides: [
      {
        order: 1,
        icon: "sparkles",
        iconColor: "cyan",
        title: "Welcome to Risk Radar",
        content:
          "Your **AI-powered command center** for insurance risk monitoring.\n\nMonitor loss ratios, claims trends, and profitability metrics in real-time across all product lines.",
        highlight: "Tasco Insurance",
      },
      {
        order: 2,
        icon: "chart",
        iconColor: "primary",
        title: "Real-Time Dashboard",
        content:
          "Track key performance indicators at a glance:\n\n- **Loss Ratio** - Claims vs premiums earned\n- **Combined Ratio** - Total cost of operations\n- **Premium Growth** - Revenue trends\n- **Claims Analysis** - Settlement patterns",
        highlight: "Live Metrics",
      },
      {
        order: 3,
        icon: "zap",
        iconColor: "red",
        title: "Smart Alert System",
        content:
          "AI-powered anomaly detection alerts you to potential issues **before they escalate**.\n\n- Loss ratio spikes\n- Unusual claim patterns\n- Profitability decline\n- Concentration risk",
        highlight: "Early Warning",
      },
      {
        order: 4,
        icon: "search",
        iconColor: "purple",
        title: "Deep Analysis",
        content:
          "Dive deep into your data with **interactive visualizations**.\n\nCompare performance across:\n- Product lines (Motor, Health, Property, Life)\n- Geographic regions\n- Time periods",
        highlight: "Insights",
      },
      {
        order: 5,
        icon: "brain",
        iconColor: "blue",
        title: "AI Risk Assistant",
        content:
          "Ask questions in **plain language** and get instant insights.\n\n*\"What caused the loss ratio spike in motor insurance?\"*\n\n*\"Compare Q3 vs Q4 profitability\"*\n\n*\"Show me claims trends by region\"*",
        highlight: "Natural Language",
      },
      {
        order: 6,
        icon: "globe",
        iconColor: "green",
        title: "Multi-Language Support",
        content:
          "Risk Radar supports **English and Vietnamese** interfaces.\n\nSwitch languages anytime using the language selector in the header.",
        highlight: "🇺🇸 🇻🇳",
      },
    ],
    ctaText: "Start Exploring",
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  vi: {
    id: "risk-radar-guide-vi",
    appId: "risk-radar",
    language: "vi",
    appName: "Radar Rủi Ro",
    appTagline: "Thông Tin Rủi Ro Được Hỗ Trợ Bởi AI Cho Bảo Hiểm",
    slides: [
      {
        order: 1,
        icon: "sparkles",
        iconColor: "cyan",
        title: "Chào Mừng Đến Risk Radar",
        content:
          "**Trung tâm điều khiển được hỗ trợ bởi AI** của bạn để giám sát rủi ro bảo hiểm.\n\nTheo dõi tỷ lệ tổn thất, xu hướng bồi thường và các chỉ số lợi nhuận theo thời gian thực trên tất cả dòng sản phẩm.",
        highlight: "Tasco Insurance",
      },
      {
        order: 2,
        icon: "chart",
        iconColor: "primary",
        title: "Bảng Điều Khiển Thời Gian Thực",
        content:
          "Theo dõi các chỉ số hiệu suất chính một cách nhanh chóng:\n\n- **Tỷ Lệ Tổn Thất** - Bồi thường so với phí thu được\n- **Tỷ Lệ Kết Hợp** - Tổng chi phí hoạt động\n- **Tăng Trưởng Phí** - Xu hướng doanh thu\n- **Phân Tích Bồi Thường** - Mô hình thanh toán",
        highlight: "Chỉ Số Trực Tiếp",
      },
      {
        order: 3,
        icon: "zap",
        iconColor: "red",
        title: "Hệ Thống Cảnh Báo Thông Minh",
        content:
          "Phát hiện bất thường bằng AI cảnh báo bạn về các vấn đề tiềm ẩn **trước khi chúng leo thang**.\n\n- Tỷ lệ tổn thất tăng đột biến\n- Mô hình bồi thường bất thường\n- Lợi nhuận suy giảm\n- Rủi ro tập trung",
        highlight: "Cảnh Báo Sớm",
      },
      {
        order: 4,
        icon: "search",
        iconColor: "purple",
        title: "Phân Tích Chuyên Sâu",
        content:
          "Đi sâu vào dữ liệu của bạn với **trực quan hóa tương tác**.\n\nSo sánh hiệu suất trên:\n- Dòng sản phẩm (Xe, Sức khỏe, Tài sản, Nhân thọ)\n- Khu vực địa lý\n- Khoảng thời gian",
        highlight: "Thông Tin Chi Tiết",
      },
      {
        order: 5,
        icon: "brain",
        iconColor: "blue",
        title: "Trợ Lý AI Rủi Ro",
        content:
          "Đặt câu hỏi bằng **ngôn ngữ tự nhiên** và nhận thông tin ngay lập tức.\n\n*\"Điều gì gây ra tỷ lệ tổn thất tăng trong bảo hiểm xe?\"*\n\n*\"So sánh lợi nhuận Q3 và Q4\"*\n\n*\"Cho tôi xem xu hướng bồi thường theo khu vực\"*",
        highlight: "Ngôn Ngữ Tự Nhiên",
      },
      {
        order: 6,
        icon: "globe",
        iconColor: "green",
        title: "Hỗ Trợ Đa Ngôn Ngữ",
        content:
          "Risk Radar hỗ trợ giao diện **Tiếng Anh và Tiếng Việt**.\n\nChuyển đổi ngôn ngữ bất cứ lúc nào bằng cách sử dụng bộ chọn ngôn ngữ trong tiêu đề.",
        highlight: "🇺🇸 🇻🇳",
      },
    ],
    ctaText: "Bắt Đầu Khám Phá",
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") || "en";

  // Get guide for requested language, fallback to English
  const guide = guides[lang as keyof typeof guides] || guides.en;
  const isFallback = !guides[lang as keyof typeof guides];

  return NextResponse.json({
    success: true,
    guide,
    fallback: isFallback,
  });
}
