export type Paginated<T> = {
  data: T[];
  pagination: {
    totalPages: number;
    page: number;
    limit: number;
  };
};
