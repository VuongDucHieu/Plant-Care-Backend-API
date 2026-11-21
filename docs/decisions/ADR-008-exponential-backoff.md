# ADR-008 — Exponential backoff có giới hạn

- **Trạng thái:** Proposed

## Context

Nếu ADR-007 được thực thi, delay cố định có thể làm nhiều request lỗi cùng thử lại theo nhịp giống nhau. Repository chưa có thuật toán delay hay max delay trong code.

## Decision

Đề xuất delay tăng theo exponential backoff và bị chặn bởi maximum delay. Công thức cơ sở trước jitter: `min(maxDelayMs, baseDelayMs × 2^retryIndex)`.

## Alternatives considered

- Không có delay giữa retry.
- Fixed delay.
- Exponential backoff không giới hạn.

## Rationale

Delay tăng dần giảm tốc độ dồn request vào dependency đang gặp lỗi. Giới hạn trên tránh wait quá dài khi retry index tăng.

## Consequences and trade-offs

- Đây là thiết kế đề xuất, chưa được triển khai.
- Backoff tăng thời gian response và cần phối hợp với timeout budget.
- Chưa có `maxDelayMs` trong `envSchema`; `GEMINI_RETRY_BASE_DELAY_MS` một mình không đủ để thực thi đầy đủ quyết định này.

## Implementation references

- Cấu hình base delay hiện có nhưng chưa dùng: `src/config/env.ts`
- Vị trí utility dự kiến: `src/shared/async/with-retry.ts`

## Follow-up considerations

Chọn `maxDelayMs`, đơn vị retry index và metrics dựa trên dữ liệu vận hành trước khi implement. Xem [reliability/backoff](../engineering/reliability/backoff.md).
