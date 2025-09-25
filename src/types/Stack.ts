import type { Node_ } from "./Node_";

class Stack<T> {
    private top: Node_<T> | null = null;
    private _size: number = 0;

    push(item: T): void {
        const newNode: Node_<T> = {
            data: item as NonNullable<T>,
            prev: null,
            next: this.top
        };
        if (this.top) {
            this.top.prev = newNode;
        }
        this.top = newNode;
        this._size++;
    }

    pop(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const data = this.top!.data;
        this.top = this.top!.next;
        if (this.top) {
            this.top.prev = null;
        }
        this._size--;
        return data;
    }

    peek(): T | null {
        return this.top ? this.top.data : null;
    }

    isEmpty(): boolean {
        return this.top === null;
    }

    size(): number {
        return this._size;
    }

    clear(): void {
        this.top = null;
        this._size = 0;
    }
}