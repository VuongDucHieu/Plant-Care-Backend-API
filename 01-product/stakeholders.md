# Plant Care — Stakeholder Analysis

> **Status:** Draft · Danh sách **vai trò**, không phải tên cá nhân được xác nhận.

## Stakeholder register

| Stakeholder | Vai trò / lợi ích | Mức ảnh hưởng | Cách tham gia dự kiến |
|---|---|---|---|
| Người mới trồng cây (primary user) | Muốn hiểu cây, theo dõi chăm sóc ít thao tác | Cao với UX | Interview, prototype, UAT |
| Người có nhiều cây | Muốn quản lý công việc và lịch sử theo từng cây | Trung bình | Feedback về multi-plant workflows |
| Product Owner / Project Sponsor | Xác định mục tiêu, ưu tiên, MVP và ngân sách | Cao | Phê duyệt scope, trade-offs |
| Business Analyst | Làm rõ nhu cầu và Business Rules | Cao với đặc tả | Elicitation, traceability, acceptance review |
| Backend Developer | Xây API, lưu dữ liệu, scheduler, tích hợp AI | Cao với feasibility | Design review, implementation |
| Frontend / UX Designer | Thiết kế trải nghiệm và cách giải thích AI/điều kiện thực tế | Cao với UX | Prototype, usability review |
| QA / Tester | Kiểm tra acceptance criteria và state transitions | Cao với chất lượng | Test design, regression/UAT |
| AI provider (Google Gemini) | External technical dependency | Phụ thuộc bên ngoài | Quota, latency, schema, availability monitoring |
| Chuyên gia thực vật (tiềm năng) | Phản biện an toàn/hợp lý của hướng dẫn | Chưa xác định | Review sample outputs nếu có nguồn lực |

## RACI sơ bộ cho yêu cầu tính năng

| Hoạt động | Product Owner | BA | Dev | QA | Người dùng thử nghiệm |
|---|---|---|---|---|---|
| Xác định giá trị và phạm vi | A | R | C | C | C |
| Viết và làm rõ requirements | A | R | C | C | C |
| Quyết định thiết kế kỹ thuật | C | C | A/R | C | I |
| Kiểm chứng acceptance criteria | A | R | R | R | C |

**R** Responsible; **A** Accountable; **C** Consulted; **I** Informed. Đây là RACI **đề xuất**, chưa được tổ chức chính thức phê duyệt.

## Key risks for stakeholder alignment

- Người dùng có thể hiểu recommendation là chỉ định bắt buộc; UX phải nhấn mạnh điều kiện thực tế.
- PO cần xác nhận behavior của Reject, personalization updates và notification trước khi chốt release scope.
- Dev và QA cần thống nhất `CareSchedule` khác `CareTask` và Overdue là trạng thái hiển thị tính toán.

## Elicitation checklist

- Phỏng vấn người dùng: tác vụ chăm sóc hiện tại, tình huống quên lịch, cách tự đánh giá đất/ánh sáng.
- Product review: vòng đời Reject, missing information, lịch cố định và nguyên tắc AI advisory.
- Technical discovery: authentication, persistence, timezone, scheduling reliability.
