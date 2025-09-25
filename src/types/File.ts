import type { Node_ } from "./Node_"

export type File<T> = Node_<T> & {
    data: Blob;
}