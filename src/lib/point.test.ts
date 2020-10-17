import { expect } from 'chai';
import { Point } from './point';

describe('Point', () => {
	describe('#clone', () => {
		it('should make an independent copy', () => {
			const p1 = new Point(1, 2);
			const p2 = p1.clone();
			expect(p1 === p2).to.equal(false);
			expect(p1.x).to.equal(p2.x);
			expect(p1.y).to.equal(p2.y);
		});
	});
});
