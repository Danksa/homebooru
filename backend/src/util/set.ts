export const union = <T>(sets: ReadonlyArray<ReadonlySet<T>>): Set<T> => {
    const result = new Set<T>();
    for(const set of sets) {
        set.forEach(value => result.add(value));
    }
    return result;
};