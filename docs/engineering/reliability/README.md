# Reliability engineering

Các tài liệu này phân biệt rõ cơ chế đã có trong source với thiết kế đề xuất.

| Chủ đề                                | Trạng thái  | Bằng chứng                                  |
| ------------------------------------- | ----------- | ------------------------------------------- |
| [Timeout và cancellation](timeout.md) | Implemented | `withTimeout()` được Gemini adapter sử dụng |
| [Retry](retry.md)                     | Proposed    | `with-retry.ts` rỗng, chưa có call site     |
| [Exponential backoff](backoff.md)     | Proposed    | Chưa có thuật toán delay trong source       |
| [Jitter](jitter.md)                   | Proposed    | Chưa có random delay trong source           |

Timeout hiện chỉ giới hạn một Gemini operation. Nếu bổ sung retry, thiết kế cần phối hợp retryability, số attempt, delay, timeout budget và cancellation thay vì ghép từng cơ chế độc lập.

ADR liên quan: [ADR-005](../../decisions/ADR-005-timeout-and-cancellation.md), [ADR-007](../../decisions/ADR-007-retry-policy.md), [ADR-008](../../decisions/ADR-008-exponential-backoff.md), [ADR-009](../../decisions/ADR-009-jitter-strategy.md).
