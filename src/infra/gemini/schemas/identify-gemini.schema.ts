export const identifyGeminiSchema = {
  type: 'object',

  properties: {
    overview: {
      type: 'object',
      properties: {
        commonName: {
          type: 'string',
        },
        scientificName: {
          type: 'string',
        },
        description: {
          type: 'string',
        },
      },
      required: ['commonName', 'scientificName', 'description'],
    },

    requirements: {
      type: 'object',
      properties: {
        light: {
          type: 'string',
        },
        water: {
          type: 'string',
        },
        temperature: {
          type: 'string',
        },
      },
      required: ['light', 'water', 'temperature'],
    },

    carePlan: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
        },
        recommendations: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
      required: ['summary', 'recommendations'],
    },
  },

  required: ['overview', 'requirements', 'carePlan'],
};
