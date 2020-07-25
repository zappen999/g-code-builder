export function isSet<T>(val?: T): val is T {
	return typeof val !== 'undefined';
}
