export type ImageInput = {
  bytes: Buffer;
  mimeType: string;
};

//===== IDENTIFY =====
export type PlantOverview = {
  commonName: string;
  scientificName: string;
  description: string;
};

export type PlantRequirement = {
  light: string;
  water: string;
  temperature: string;
};

export type CarePlan = {
  summary: string;
  recommendations: string[];
};

export type IdentifyPlantResult = {
  overview: PlantOverview;
  requirements: PlantRequirement;
  carePlan: CarePlan;
};

//===== DIAGNOSE =====
export type DiagnosedPlantIdentity = {
  commonName: string;
  scientificName: string;
}

export type PlantDiagnosis = {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  possibleCauses: string[];
};

export type TreatmentPlan = {
  actions: string[];
  notes: string[];
};

export type DiagnosePlantResult = {
  plant: DiagnosedPlantIdentity;
  diagnosis: PlantDiagnosis;
  treatmen: TreatmentPlan;
}

//===== ERROR =====
export type PlantAnalyzerErrorCode =
  'RATE_LIMITED' | 'TIMEOUT' | 'UNAVAILABLE' | 'INVALID_RESPONSE' | 'UNKNOWN';
