export declare class PaginationDto {
    page?: number;
    limit?: number;
}
export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
    };
}
