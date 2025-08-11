export class ApiResponse<T = any> {
    constructor(
        public readonly success: boolean,
        public readonly data?: T,
        public readonly message?: string,
        public readonly errors?: string[],
        public readonly timestamp: Date = new Date(),
    ) { }

    static success<T>(data?: T, message?: string): ApiResponse<T> {
        return new ApiResponse(true, data, message);
    }

    static error(message: string, errors?: string[]): ApiResponse<null> {
        return new ApiResponse(false, null, message, errors);
    }
}
