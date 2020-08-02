export function isSet<T>(val?: T): val is T {
	return typeof val !== 'undefined';
}

export function isOdd(n: number): boolean {
	return Boolean(n % 2);
}
