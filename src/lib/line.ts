import { Point, IPoint } from './point';

export interface ILine {
	start: IPoint;
	end: IPoint;
}

const EPSILON = 0.000001;

export class Line implements ILine {
	constructor (
		public start: IPoint,
		public end: IPoint
	) { }
	static getLineIntersection (
		line1: ILine,
		line2: ILine
	): Point|null {
		const { start: p0, end: p1 } = line1;
		const { start: p2, end: p3 } = line2;

		const alt1 = Line.isPointOnLine(line1, line2.start);
		const alt2 = Line.isPointOnLine(line1, line2.end);

		if (alt1 || alt2) {
			return null;
		}

		const s1_x = p1.x - p0.x;
		const s1_y = p1.y - p0.y;
		const s2_x = p3.x - p2.x;
		const s2_y = p3.y - p2.y;

		const s = (
			-s1_y * (p0.x - p2.x) + s1_x * (p0.y - p2.y)
		) / (-s2_x * s1_y + s1_x * s2_y);
		const t = (
			s2_x * (p0.y - p2.y) - s2_y * (p0.x - p2.x)
		) / (-s2_x * s1_y + s1_x * s2_y);

		if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
		{
			// Collision detected
			return new Point(
				p0.x + (t * s1_x),
				p0.y + (t * s1_y)
			);
		}

		return null; // No collision
	}

	static isPointOnLine (line: ILine, p: IPoint): boolean {
		const aTmpY = new Point(
			line.end.x - line.start.x,
			line.end.y - line.start.y
		);

		const bTmp = new Point(p.x - line.start.x, p.y - line.start.y);
		const r = aTmpY.crossProduct(bTmp);

		return Math.abs(r) < EPSILON;
	}
}
