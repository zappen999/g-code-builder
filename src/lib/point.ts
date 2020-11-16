export interface IPoint {
	x: number;
	y: number;
}

export class Point implements IPoint {
	constructor (
		public x: number,
		public y: number
	) { }

	distanceTo (p: IPoint): number {
		return Math.sqrt(
			Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2)
		);
	}

	isEqual (p: IPoint): boolean {
		return p.x === this.x && p.y === this.y;
	}

	clone (): Point {
		return new Point(this.x, this.y);
	}

	crossProduct(b: IPoint): number {
		return this.x * b.y - b.x * this.y;
	}
}
