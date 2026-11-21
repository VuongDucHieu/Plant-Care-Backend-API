# Architecture Decision Records

ADR ghi lại quyết định có ảnh hưởng đến cấu trúc và hành vi của Plant Care Backend API. Trạng thái **Accepted** nghĩa là quyết định đã có bằng chứng trong source code hiện tại. Trạng thái **Proposed** là hướng thiết kế, chưa phải hành vi runtime.

| ADR                                                | Trạng thái | Quyết định                                             |
| -------------------------------------------------- | ---------- | ------------------------------------------------------ |
| [ADR-001](ADR-001-modular-monolith.md)             | Proposed   | Giữ một backend application thay vì tách microservices |
| [ADR-002](ADR-002-image-normalization.md)          | Accepted   | Chuẩn hóa ảnh bằng Sharp                               |
| [ADR-003](ADR-003-two-image-diagnosis.md)          | Accepted   | Chẩn đoán từ hai ảnh trong một Gemini request          |
| [ADR-004](ADR-004-provider-response-validation.md) | Accepted   | Validation response bằng JSON Schema và Zod            |
| [ADR-005](ADR-005-timeout-and-cancellation.md)     | Accepted   | Timeout và cancellation bằng AbortController           |
| [ADR-006](ADR-006-provider-error-mapping.md)       | Accepted   | Ánh xạ lỗi provider vào lỗi domain/HTTP                |
| [ADR-007](ADR-007-retry-policy.md)                 | Proposed   | Retry có điều kiện cho lỗi tạm thời                    |
| [ADR-008](ADR-008-exponential-backoff.md)          | Proposed   | Exponential backoff có giới hạn                        |
| [ADR-009](ADR-009-jitter-strategy.md)              | Proposed   | Full jitter cho retry delay                            |

Không suy ra lịch sử quyết định, benchmark hoặc production incident từ các ADR này. Chỉ các reference source code mới mô tả hành vi đang chạy.
