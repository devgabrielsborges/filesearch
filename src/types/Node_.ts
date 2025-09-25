export type Node_<T> = {
    data: NonNullable<T>,
    prev: Node_<T> | null,
    next: Node_<T> | null;
}