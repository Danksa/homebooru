export type Repository<T, Data> = {
    get(id: number): T;
    create(data: Data): Promise<T>;
    delete(id: number): Promise<void>;
    list(): AsyncGenerator<T>;
    count(): Promise<number>;
    highestId(): Promise<number>;
};
