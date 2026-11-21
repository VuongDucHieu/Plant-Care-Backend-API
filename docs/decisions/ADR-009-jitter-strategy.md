# ADR-009 — Full jitter cho retry delay

- **Trạng thái:** Proposed

## Context

Exponential backoff xác định vẫn có thể đồng bộ nhiều client cùng retry sau một outage. Source hiện không có random delay hoặc retry implementation.

## Decision

Nếu retry/backoff được implement, đề xuất full jitter: sau khi tính `cappedDelay`, chọn ngẫu nhiên một delay trong khoảng từ 0 đến `cappedDelay`.

## Alternatives considered

- Không dùng jitter.
- Equal jitter.
- Decorrelated jitter.

## Rationale

Full jitter đơn giản, phân tán retry và tránh một nhịp retry cố định của nhiều request.

## Consequences and trade-offs

- Đây chưa phải hành vi runtime.
- Độ trễ một attempt khó dự đoán hơn; test cần inject hoặc kiểm soát random source.
- Jitter không thay thế rate limiting, concurrency limit, timeout hay error classification.

## Implementation references

- Vị trí utility dự kiến: `src/shared/async/with-retry.ts`
- Không có source code full jitter hiện tại.

## Follow-up considerations

Xác định random source, observability cho delay thực tế và cách test deterministic trước khi implement. Xem [reliability/jitter](../engineering/reliability/jitter.md).
