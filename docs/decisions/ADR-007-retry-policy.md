# ADR-007 — Retry có điều kiện cho lỗi tạm thời

- **Trạng thái:** Proposed

## Context

Một số failure của provider có thể tạm thời, nhưng retry mù quáng tăng tải, chi phí và nguy cơ tạo yêu cầu lặp. Repository có `GEMINI_MAX_RETRIES` trong env schema, nhưng `with-retry.ts` hiện rỗng và Gemini adapter không gọi retry utility.

## Decision

Đề xuất chỉ retry các lỗi được phân loại retryable, giới hạn bằng `maxRetries`, và giữ tổng thời gian trong một timeout budget xác định. Không retry validation lỗi input, response không hợp lệ, hoặc lỗi provider được xác định là không tạm thời.

## Alternatives considered

- Không retry tại backend.
- Retry mọi lỗi với số lần cố định.
- Để client tự retry toàn bộ.

## Rationale

Retry có điều kiện có thể cải thiện khả năng phục hồi với failure ngắn hạn mà vẫn bảo vệ provider. Quyết định retry theo error semantics tránh biến lỗi xác định thành nhiều request vô ích.

## Consequences and trade-offs

- Đây chưa phải hành vi source code; không được xem là cam kết runtime.
- Nhiều attempt làm tăng latency, token/cost và tải provider.
- Cần xác định attempt count rõ ràng: `maxRetries` là số retry sau attempt đầu, không phải tổng attempt.

## Implementation references

- Cấu hình hiện có nhưng chưa được sử dụng: `src/config/env.ts`
- Placeholder hiện có nhưng chưa triển khai: `src/shared/async/with-retry.ts`
- Điểm tích hợp dự kiến: `src/infra/gemini/gemini-plant-analyzer.ts`

## Follow-up considerations

Chốt retryable error set, timeout budget, observability và kiểm thử trước khi implement. Xem [reliability/retry](../engineering/reliability/retry.md).
