import { Point, IPoint } from './point';
import type { ILine } from './line';

export class Circle {
	constructor (
		public pos: IPoint,
		public radius: number
	) { }

	findLineIntersections (
		line: ILine,
	): { a?: IPoint; b?: IPoint } {
		const dx = line.end.x - line.start.x;
		const dy = line.end.y - line.start.y;

		const a = dx * dx + dy * dy;
		const b = 2 * (
			dx * (line.start.x - this.pos.x) +
			dy * (line.start.y - this.pos.y));
		const c =
			(line.start.x - this.pos.x) * (line.start.x - this.pos.x) +
			(line.start.y - this.pos.y) * (line.start.y - this.pos.y) -
			this.radius * this.radius;

		const det = b * b - 4 * a * c;

		if ((a <= 0.0000001) || (det < 0)) {
			return {}; // No real solutions
		} else if (det == 0) {
			// One solution
			const t = -b / (2 * a);
			return {
				a: new Point(
					line.start.x + t * dx,
					line.start.y + t * dy
				),
			}
		} else {
			// Two solutions
			const t1 = (-b + Math.sqrt(det)) / (2 * a);
			const t2 = (-b - Math.sqrt(det)) / (2 * a);
			return {
				a: new Point(
					line.start.x + t1 * dx,
					line.start.y + t1 * dy
				),
				b: new Point(
					line.start.x + t2 * dx,
					line.start.y + t2 * dy
				),
			};
		}
	}
}
