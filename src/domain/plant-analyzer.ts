import type {
    DiagnosePlantResult,
    IdentifyPlantResult,
    ImageInput
} from './plant.types.js'

export interface PlantAnalyzer {
    identify(images: ImageInput[]): Promise<IdentifyPlantResult>

    diagnose(images: ImageInput[]): Promise<DiagnosePlantResult>
}