export type Cachable<Data> = {
    exists(): Promise<boolean>;
    save(data: Partial<Data>): Promise<void>;
    delete(): Promise<void>;
};
