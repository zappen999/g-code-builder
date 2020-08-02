export class Point {
	constructor (
		public x: number,
		public y: number
	) { }

	distanceTo (p: Point): number {
		return Math.sqrt(
			Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2)
		);
	}

	isEqual (p: Point): boolean {
		return p.x === this.x && p.y === this.y;
	}
}
