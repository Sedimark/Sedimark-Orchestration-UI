export default class Stack {
    constructor() {
        this.items = []; // The array to store stack elements
    }

    // Add an element to the top of the stack
    push(element) {
        this.items.push(element);
    }

    // Remove and return the top element from the stack
    pop() {
        if (this.isEmpty()) {
            return "Underflow"; // Or throw an error
        }
        return this.items.pop();
    }

    // Return the top element without removing it
    peek() {
        if (this.isEmpty()) {
            return "No elements in Stack";
        }
        return this.items[this.items.length - 1];
    }

    // Check if the stack is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get the number of elements in the stack
    size() {
        return this.items.length;
    }

    // Clear the stack
    clear() {
        this.items = [];
    }

    // Print the stack elements (for debugging)
    printStack() {
        let str = "";
        for (let i = 0; i < this.items.length; i++) {
            str += this.items[i] + " ";
        }
        return str.trim();
    }

    getStack(){
        return this.items;
    }
}

