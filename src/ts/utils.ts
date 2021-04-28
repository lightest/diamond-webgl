function registerStringStartsWithPolyfill(): void {
    if (typeof String.prototype.startsWith !== "function") {
        String.prototype.startsWith = function (tested: string): boolean {
            return this.indexOf(tested) === 0;
        };
    }
}

function registerPolyfills(): void {
    registerStringStartsWithPolyfill();
}

export {
    registerPolyfills,
};
