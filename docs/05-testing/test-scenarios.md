# IdentifyPlantUseCase Unit Test Workflow

`IdentifyPlantUseCase.execute()` is real production code; `ImageNormalizer` and
`PlantAnalyzer` are Vitest mocks, so no Gemini SDK or network call occurs.

```mermaid
flowchart TD
    START["Vitest starts"]
    FIXTURES["Arrange plantImage, normalizedPlant, and expectedResult"]
    MOCKN["Mock ImageNormalizer normalize"]
    MOCKA["Mock PlantAnalyzer identify and diagnose"]
    SUT["Create IdentifyPlantUseCase"]
    EXEC["execute(images)"]
    VALID{"Exactly one image?"}
    NORMALIZE["imageNormalizer.normalize(plantImage)"]
    NORMALIZED["normalizedPlant"]
    IDENTIFY["plantAnalyzer.identify([normalizedPlant])"]
    RETURN["Return expectedResult"]
    SUCCESS["Assert success path"]
    ERROR["Throw ImageInputError INVALID_IMAGE"]
    FAILURE["Assert dependencies were not called"]

    START --> FIXTURES
    FIXTURES --> MOCKN
    FIXTURES --> MOCKA
    MOCKN -->|"Inject"| SUT
    MOCKA -->|"Inject"| SUT
    SUT --> EXEC
    EXEC --> VALID
    VALID -->|"Yes"| NORMALIZE
    NORMALIZE -->|"Calls"| MOCKN
    MOCKN -->|"Returns"| NORMALIZED
    NORMALIZED --> IDENTIFY
    IDENTIFY -->|"Calls"| MOCKA
    MOCKA -->|"Returns"| RETURN
    RETURN --> SUCCESS
    VALID -->|"No"| ERROR
    ERROR --> FAILURE

    classDef setup fill:#e0f2fe,stroke:#0284c7,color:#0f172a;
    classDef production fill:#dbeafe,stroke:#2563eb,color:#0f172a;
    classDef mock fill:#fef3c7,stroke:#d97706,color:#0f172a;
    classDef assertion fill:#fce7f3,stroke:#db2777,color:#0f172a;
    classDef data fill:#ecfdf5,stroke:#059669,color:#0f172a;
    class START,FIXTURES setup;
    class SUT,EXEC,VALID,NORMALIZE,IDENTIFY,RETURN,ERROR production;
    class MOCKN,MOCKA mock;
    class NORMALIZED data;
    class SUCCESS,FAILURE assertion;
```

**Legend:** light blue = Vitest setup; blue = real SUT logic; yellow = mock;
green = fixture value; pink = assertion.

| Assertion                                | What the test verifies                                                     |
| ---------------------------------------- | -------------------------------------------------------------------------- |
| `normalize` once with `plantImage`       | The valid path normalizes the original image.                              |
| `identify` once with `[normalizedPlant]` | Only the normalized image is identified.                                   |
| `diagnose` is not called                 | The Identify path does not diagnose.                                       |
| `result.toEqual(expectedResult)`         | The analyzer mock result is returned.                                      |
| Zero or two images                       | Rejects with `ImageInputError` / `INVALID_IMAGE`; no dependency is called. |
