export type Cachable<Data> = {
    readonly id: number;
    exists(): Promise<boolean>;
    save(data: Partial<Data>): Promise<void>;
    delete(): Promise<void>;
};
