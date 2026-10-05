export const diagnoseGeminiSchema = {
    type: 'object',

    properties: {
        diagnosis: {
            type: 'object',

            properties: {
                condition: {
                    type: 'string',
                },

                severity: {
                    type: 'string',
                    enum: ['low', 'medium', 'high'],
                },

                possibleCauses: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },

            required: [
                'condition',
                'severity',
                'possibleCauses',
            ],
        },

        treatment: {
            type: 'object',

            properties: {
                actions: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },

                notes: {
                    type: 'array',
                    items: {
                        type: 'string',
                    },
                },
            },

            required: [
                'actions',
                'notes',
            ],
        },
    },

    required: [
        'diagnosis',
        'treatment',
    ],
};