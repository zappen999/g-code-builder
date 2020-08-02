import { Point } from './point';

export class Line {
	constructor (
		public start: Point,
		public end: Point
	) { }

	static getLineIntersection (
		line1: Line,
		line2: Line
	): Point|undefined {
		// Line1
		const al1 = line1.end.y - line1.start.y;
		const bl1 = line1.start.x - line1.end.x;
		const cl1 = (al1 * line1.start.x) + (bl1 * line1.start.y);

		// Line2
		const al2 = line2.end.y - line2.start.y;
		const bl2 = line2.start.x - line2.end.x;
		const cl2 = al2 * line2.start.x + bl2 * line2.start.y;

		const determinant = al1 * bl2 - al2 * bl1;

		if (determinant === 0) {
			return undefined; // Lines are parallel
		}

		return new Point(
			(bl2 * cl1 - bl1 * cl2)/determinant,
			(al1 * cl2 - al2 * cl1)/determinant,
		);
	}
}


