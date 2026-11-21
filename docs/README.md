# Plant Care Backend API — Documentation

Điểm bắt đầu để đọc tài liệu sản phẩm, kiến trúc và quyết định kỹ thuật của repository.

## Kiến trúc

- [Kiến trúc hiện tại](architecture/01-current-architecture.md)
- [Vòng đời HTTP request](architecture/02-request-lifecycle.md)
- [Dependency injection trong `createApp()`](architecture/03-dependency-injection.md)
- [Tích hợp Gemini và xử lý response](architecture/04-gemini-integration.md)
- [Readiness và failure scenarios](architecture/ARCH-003.5-readiness-failure-scenarios.md)

## Architecture Decision Records

- [ADR index](decisions/README.md)

## Reliability engineering

- [Tổng quan reliability](engineering/reliability/README.md)
- [Timeout và cancellation](engineering/reliability/timeout.md)
- [Retry](engineering/reliability/retry.md)
- [Exponential backoff](engineering/reliability/backoff.md)
- [Jitter](engineering/reliability/jitter.md)

## Sản phẩm, yêu cầu và kiểm thử

- [Product overview](product/product-overview.md)
- [Yêu cầu Identify Plant](requirements/identify-plant.md)
- [Workflow test Identify](testing/identify-usecase-workflow.md)
- [Workflow test Diagnose](testing/diagnose-usecase-workflow.md)

## Engineering journal

- [Architecture baseline](journal/001-architecture-baseline.md)

## Cách dùng chỉ mục này

Người mới nên đọc kiến trúc hiện tại, vòng đời request, rồi đến ADR index để thấy rõ phần nào đã được source code thực thi và phần nào vẫn là đề xuất. Tài liệu reliability giữ riêng các cơ chế đang có và các thiết kế dự kiến, không xem thiết kế dự kiến là hành vi runtime.
