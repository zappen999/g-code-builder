export function isSet<T>(val?: T): val is T {
	return typeof val !== 'undefined';
}

export function isOdd(n: number): boolean {
	return Boolean(n % 2);
}


// Radian is the angle between a line in a circle, and another line in a circle
// when the arc between the two is the same length as the radius.
export function deg2rad (deg: number): number {
	return deg * Math.PI / 180;
}

