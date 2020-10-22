import { expect } from 'chai';
import { Line } from './line';
import { Point } from './point';

describe('Line', () => {
	describe('#getLineIntersection', () => {
		const base = new Line({ x: 0, y: 0 }, { x: 50, y: 0 });

		const intersecting = new Line(
			{ x: 25, y: 25 },
			{ x: -25, y: -25 }
		);
		const notIntersecting = new Line(
			{ x: 0, y: 100 },
			{ x: 50, y: 100 }
		);
		const parallel = new Line(
			{ x: 0, y: 0 },
			{ x: 25, y: 0 }
		);
		const crossingButNotIntersecting = new Line(
			{ x: -10, y: -25 },
			{ x: -10, y: 25 }
		);
		const startingOnBase = new Line(
			{ x: 25, y: 0 },
			{ x: 25, y: 50 }
		);

		it('should return null when there\'s no intersection', () => {
			const res = Line.getLineIntersection(base, notIntersecting);

			expect(res).to.equal(null);
		});

		it('should return intersection point when intersecting', () => {
			const p = Line.getLineIntersection(base, intersecting);

			expect(p).to.be.instanceof(Point);
			expect(p).to.not.equal(null);

			if (!p) throw new Error('p was not Point');

			expect(p.x).to.equal(0);
			expect(p.y).to.equal(0);
		});

		it('should return null when lines are parallel', () => {
			const res = Line.getLineIntersection(base, parallel);

			expect(res).to.equal(null);
		});

		it('should return null on line crossing, but not for segments', () => {
			const res = Line.getLineIntersection(
				base,
				crossingButNotIntersecting
			);

			expect(res).to.equal(null);
		});

		it('should return null when line starts somewhere at base', () => {
			const res = Line.getLineIntersection(
				base,
				startingOnBase
			);

			expect(res).to.equal(null);

		});
	});
});
