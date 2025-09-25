import type { Node_ } from "./Node_";

class Deque<T> {
    private head: Node_<T> | null = null;
    private tail: Node_<T> | null = null;
    private _size: number = 0;

    addFirst(item: T): void {
        const newNode: Node_<T> = {
            data: item as NonNullable<T>,
            prev: null,
            next: this.head
        };
        if (this.head) {
            this.head.prev = newNode;
        } else {
            this.tail = newNode;
        }
        this.head = newNode;
        this._size++;
    }

    addLast(item: T): void {
        const newNode: Node_<T> = {
            data: item as NonNullable<T>,
            prev: this.tail,
            next: null
        };
        if (this.tail) {
            this.tail.next = newNode;
        } else {
            this.head = newNode;
        }
        this.tail = newNode;
        this._size++;
    }

    removeFirst(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const data = this.head!.data;
        this.head = this.head!.next;
        if (this.head) {
            this.head.prev = null;
        } else {
            this.tail = null;
        }
        this._size--;
        return data;
    }

    removeLast(): T | null {
        if (this.isEmpty()) {
            return null;
        }
        const data = this.tail!.data;
        this.tail = this.tail!.prev;
        if (this.tail) {
            this.tail.next = null;
        } else {
            this.head = null;
        }
        this._size--;
        return data;
    }

    peekFirst(): T | null {
        return this.head ? this.head.data : null;
    }

    peekLast(): T | null {
        return this.tail ? this.tail.data : null;
    }

    isEmpty(): boolean {
        return this.head === null;
    }

    size(): number {
        return this._size;
    }

    clear(): void {
        this.head = null;
        this.tail = null;
        this._size = 0;
    }
}