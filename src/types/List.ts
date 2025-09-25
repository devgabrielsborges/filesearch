import type { Node_ } from "./Node_";

class List<T> {
    private head: Node_<T> | null = null;
    private tail: Node_<T> | null = null;
    private _size: number = 0;

    add(item: T): void {
        this.addLast(item);
    }

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

    addAt(index: number, item: T): void {
        if (index < 0 || index > this._size) {
            throw new Error("Index out of bounds");
        }
        if (index === 0) {
            this.addFirst(item);
            return;
        }
        if (index === this._size) {
            this.addLast(item);
            return;
        }

        const nodeAtIndex = this.getNodeAt(index);
        const newNode: Node_<T> = {
            data: item as NonNullable<T>,
            prev: nodeAtIndex!.prev,
            next: nodeAtIndex
        };
        if (nodeAtIndex!.prev) {
            nodeAtIndex!.prev.next = newNode;
        }
        nodeAtIndex!.prev = newNode;
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

    removeAt(index: number): T | null {
        if (index < 0 || index >= this._size) {
            throw new Error("Index out of bounds");
        }
        if (index === 0) {
            return this.removeFirst();
        }
        if (index === this._size - 1) {
            return this.removeLast();
        }

        const nodeToRemove = this.getNodeAt(index);
        const data = nodeToRemove!.data;
        if (nodeToRemove!.prev) {
            nodeToRemove!.prev.next = nodeToRemove!.next;
        }
        if (nodeToRemove!.next) {
            nodeToRemove!.next.prev = nodeToRemove!.prev;
        }
        this._size--;
        return data;
    }

    remove(item: T): boolean {
        let current = this.head;
        while (current) {
            if (current.data === item) {
                if (current.prev) {
                    current.prev.next = current.next;
                } else {
                    this.head = current.next;
                }
                if (current.next) {
                    current.next.prev = current.prev;
                } else {
                    this.tail = current.prev;
                }
                this._size--;
                return true;
            }
            current = current.next;
        }
        return false;
    }

    get(index: number): T | null {
        if (index < 0 || index >= this._size) {
            return null;
        }
        const node = this.getNodeAt(index);
        return node ? node.data : null;
    }

    set(index: number, item: T): T | null {
        if (index < 0 || index >= this._size) {
            throw new Error("Index out of bounds");
        }
        const node = this.getNodeAt(index);
        if (node) {
            const oldData = node.data;
            node.data = item as NonNullable<T>;
            return oldData;
        }
        return null;
    }

    indexOf(item: T): number {
        let current = this.head;
        let index = 0;
        while (current) {
            if (current.data === item) {
                return index;
            }
            current = current.next;
            index++;
        }
        return -1;
    }

    contains(item: T): boolean {
        return this.indexOf(item) !== -1;
    }

    size(): number {
        return this._size;
    }

    isEmpty(): boolean {
        return this._size === 0;
    }

    clear(): void {
        this.head = null;
        this.tail = null;
        this._size = 0;
    }

    toArray(): T[] {
        const array: T[] = [];
        let current = this.head;
        while (current) {
            array.push(current.data);
            current = current.next;
        }
        return array;
    }

    private getNodeAt(index: number): Node_<T> | null {
        if (index < 0 || index >= this._size) {
            return null;
        }

        // Start from head or tail depending on which is closer
        let current: Node_<T>;
        if (index < this._size / 2) {
            current = this.head!;
            for (let i = 0; i < index; i++) {
                current = current.next!;
            }
        } else {
            current = this.tail!;
            for (let i = this._size - 1; i > index; i--) {
                current = current.prev!;
            }
        }
        return current;
    }
}