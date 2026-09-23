export type ImageInputErrorCode =
    | 'INVALID_IMAGE'
    | 'UNSUPPORTED_FORMAT'

export class ImageInputError extends Error {
    constructor(
        message: string,
        public readonly code: ImageInputErrorCode
    ) {
        super(message);
        this.name = 'ImageInputError'
    }
}