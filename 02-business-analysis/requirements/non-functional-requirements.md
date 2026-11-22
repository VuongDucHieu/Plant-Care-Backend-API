# Plant Care — Non-functional Requirements (NFR)

> **Status:** Draft; **không có performance, uptime, accuracy hay security target nào được xem là đã đạt**. Giá trị số cần benchmark, threat modeling và PO approval.

| ID | Quality attribute | Requirement draft | Verification proposal / missing decision |
|---|---|---|---|
| NFR-01 | Security | Input ảnh phải được giới hạn, định dạng được kiểm tra; secret không xuất hiện trong repo/log | Current Sharp metadata check + Multer limit; bổ sung security tests |
| NFR-02 | Reliability | Lỗi AI provider không làm trả về success giả; phân loại lỗi rate limit, timeout, unavailable | Có error mapping trong backend; test fault injection |
| NFR-03 | Data integrity | Từng task thuộc đúng plant và đúng kỳ lịch; retry không tạo task trùng | Chưa có persistence/scheduler; cần unique key design và test |
| NFR-04 | Privacy | Chỉ chủ sở hữu được xem/sửa cây và lịch sử; có chính sách xóa dữ liệu ảnh | Auth/storage chưa được chốt; cần privacy review |
| NFR-05 | Observability | Có thể xác định lỗi theo endpoint và external dependency mà không lộ ảnh/API key | Define log fields, error rate, duration, correlation id |
| NFR-06 | Performance | Đặt và đo giới hạn latency cho AI request và task screens theo môi trường mục tiêu | Chưa có SLO/p95 baseline; không tự đặt số rồi gọi là pass |
| NFR-07 | Usability | Người mới phân biệt recommendation vs yêu cầu kiểm tra, Accept vs Reject, Pending vs Overdue | Usability test theo journey và task scenarios |
| NFR-08 | Availability | Health readiness/liveness phản ánh lifecycle nhưng không kiểm tra Gemini trực tiếp | Current health endpoints; verify failure scenarios |
| NFR-09 | Maintainability | HTTP/Application/Domain/Infra boundary rõ; business rules được kiểm thử | Code review, unit + integration tests |
| NFR-10 | Scheduling correctness | Kỳ lịch phát sinh không phụ thuộc việc task trước đã Completed/Skipped/Overdue | Contract + tests khi scheduler được xây dựng |

## Decisions required before release

- Data storage, backup, retention, consent, access control.
- Timezone and recurrence semantics (DST and missed scheduler runs).
- Target p95, availability/error budgets and AI cost limits dựa vào đo thực tế.
- Push notification vs in-app reminder, retry strategy, idempotency.

## What is already evident from code

- Image upload uses `multer.memoryStorage()` with configurable per-file size.
- Sharp validates JPEG/PNG via parsed metadata and normalizes images.
- Gemini calls have timeout / domain-to-HTTP error mapping, response validation with Zod.
- Authentication, database persistence and recurring scheduler are **not evident** in `main` source reviewed on 2026-11-21.

Technical references: [System Overview](../../03-system-design/architecture/system-overview.md), [Reliability](../../03-system-design/reliability/README.md), [API](../../04-api/api-overview.md).
