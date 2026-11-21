# Plant Care Backend API — Documentation

Điểm bắt đầu để đọc tài liệu sản phẩm, kiến trúc và quyết định kỹ thuật của repository.

## Thiết kế hệ thống

- [Tổng quan hệ thống](03-system-design/architecture/system-overview.md)
- [Luồng HTTP request](03-system-design/architecture/request-flow.md)
- [Component design và dependency injection](03-system-design/architecture/component-design.md)
- [Tích hợp Gemini](03-system-design/integrations/gemini-integration.md)
- [Readiness và failure scenarios](03-system-design/reliability/failure-handling.md)

## Architecture Decision Records

- [ADR index](06-decisions/README.md)

## Reliability engineering

- [Tổng quan reliability](03-system-design/reliability/README.md)
- [Timeout và cancellation](03-system-design/reliability/timeout.md)
- [Retry](03-system-design/reliability/retry.md)
- [Exponential backoff](03-system-design/reliability/backoff.md)
- [Jitter](03-system-design/reliability/jitter.md)

## Sản phẩm, yêu cầu và kiểm thử

- [Product vision](01-product/product-vision.md)
- [Yêu cầu Identify Plant](02-business-analysis/features/plant-identification.md)
- [Test scenarios: Identify](05-testing/test-scenarios.md)
- [Workflow test Diagnose](05-testing/diagnose-usecase-workflow.md)

## Engineering journal

- [Architecture baseline](03-system-design/architecture/architecture-baseline.md)

## Cách dùng chỉ mục này

Người mới nên đọc kiến trúc hiện tại, vòng đời request, rồi đến ADR index để thấy rõ phần nào đã được source code thực thi và phần nào vẫn là đề xuất. Tài liệu reliability giữ riêng các cơ chế đang có và các thiết kế dự kiến, không xem thiết kế dự kiến là hành vi runtime.
