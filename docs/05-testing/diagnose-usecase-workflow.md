# Luồng thực thi Unit Test: DiagnosePlantUseCase

**SUT:** `DiagnosePlantUseCase.execute()` là code thật. `ImageNormalizer` và `PlantAnalyzer` là mock; test không gọi Gemini.

```mermaid
flowchart TD
    START(["Vitest bắt đầu"])

    subgraph ARRANGE ["1. ARRANGE - Chuẩn bị"]
        INPUT["plantImage và diseaseImage"]
        FIXTURES["normalizedPlant và normalizedDisease"]
        EXPECTED["expectedResult"]
        MOCK_N["Mock ImageNormalizer"]
        MOCK_A["Mock PlantAnalyzer"]
        SUT["Tạo DiagnosePlantUseCase với 2 mock"]
    end

    subgraph ACT ["2. ACT - Thực thi"]
        EXEC["execute: plantImage, diseaseImage"]
        NORMALIZE["Promise.all: normalize cả 2 ảnh"]
        ORDER["Kết quả theo thứ tự: plant, disease"]
        DIAGNOSE["Gọi diagnose với 2 ảnh đã normalize"]
        RETURN["Use Case trả về result"]
    end

    subgraph ASSERT ["3. ASSERT - Xác minh"]
        CHECK["normalize 2 lần; diagnose 1 lần"]
        CHECK_ORDER["Thứ tự plant trước disease"]
        CHECK_RESULT["identify 0 lần; result bằng expectedResult"]
    end

    START --> INPUT
    INPUT --> MOCK_N
    FIXTURES --> MOCK_N
    EXPECTED --> MOCK_A
    MOCK_N --> SUT
    MOCK_A --> SUT
    SUT --> EXEC
    EXEC --> NORMALIZE
    NORMALIZE -->|"2 lời gọi tới mock"| MOCK_N
    MOCK_N -->|"Trả 2 ảnh đã normalize"| ORDER
    ORDER --> DIAGNOSE
    DIAGNOSE -->|"1 lời gọi tới mock"| MOCK_A
    MOCK_A -->|"Trả expectedResult"| RETURN
    RETURN --> CHECK
    CHECK --> CHECK_ORDER
    CHECK_ORDER --> CHECK_RESULT

    classDef real fill:#dbeafe,stroke:#2563eb,color:#111827
    classDef mock fill:#fef3c7,stroke:#d97706,color:#111827
    classDef test fill:#ecfdf5,stroke:#059669,color:#111827
    classDef assert fill:#fce7f3,stroke:#db2777,color:#111827
    class SUT,EXEC,NORMALIZE,ORDER,DIAGNOSE,RETURN real
    class MOCK_N,MOCK_A mock
    class START,INPUT,FIXTURES,EXPECTED test
    class CHECK,CHECK_ORDER,CHECK_RESULT assert
```

**Chú giải:** Xanh dương: logic Use Case; vàng: mock; xanh lá: dữ liệu test; hồng: assertion.

| Assertion | Ý nghĩa |
| --- | --- |
| `normalize` gọi 2 lần | Hai ảnh được gửi đến normalizer |
| `diagnose` gọi 1 lần | Use Case chỉ gọi một lần tới mock analyzer |
| `diagnose` nhận `[normalizedPlant, normalizedDisease]` | Giữ đúng thứ tự ảnh |
| `identify` không được gọi | Không gọi nhánh Identify |
| `result.toEqual(expectedResult)` | Use Case trả đúng kết quả từ mock |

`Promise.all()` giữ thứ tự kết quả theo input, không bảo đảm thứ tự hoàn thành và không tự tạo CPU parallelism.
