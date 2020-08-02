import { Block } from './block';
import { Point } from './point';
import { Line } from './line';
import type { XYZ } from './types';
import { isSet } from './helpers';

// TODO: This is an XY-bounded block, not 3D, yet.
// TODO: This does not fully cover all operations of a Block.
export class BoundedBlock extends Block {
	public pos: Point;
	protected readonly origin: Point;

	protected rightLine: Line;
	protected leftLine: Line;
	protected topLine: Line;
	protected bottomLine: Line;

	constructor (
		public width: number,
		public height: number
	) {
		super();

		this.pos = new Point(0, 0);
		this.origin = new Point(0, 0);

		this.rightLine = new Line(
			this.origin,
			new Point(0, -height),
		);

		this.leftLine = new Line(
			new Point(-width, 0),
			new Point(-width, -height),
		);

		this.topLine = new Line(
			this.origin,
			new Point(-width, 0),
		);

		this.bottomLine = new Line(
			new Point(0, -height),
			new Point(-width, -height),
		);
	}

	protected getOutOfBoundPosition (next: Point): Point|null {
		let outOfBoundsX: Point|undefined;
		let outOfBoundsY: Point|undefined;
		let outOfBounds = false;

		const moveLine: Line = new Line(this.pos, next);

		if (next.x > 0) { // Right
			outOfBoundsX = Line.getLineIntersection(this.rightLine, moveLine);
			outOfBounds = true;
		} else if (next.x < -this.width) { // Left
			outOfBoundsX = Line.getLineIntersection(this.leftLine, moveLine);
			outOfBounds = true;
		}

		if (next.y > 0) { // Up
			outOfBoundsY = Line.getLineIntersection(this.topLine, moveLine);
			outOfBounds = true;
		} else if (next.y < -this.height) { // Down
			outOfBoundsY = Line.getLineIntersection(this.bottomLine, moveLine);
			outOfBounds = true;
		}

		if (outOfBoundsX && outOfBoundsY) {
			const distanceX = this.pos.distanceTo(outOfBoundsX);
			const distanceY = this.pos.distanceTo(outOfBoundsY);

			return distanceX > distanceY ? outOfBoundsY : outOfBoundsX;
		} else if (outOfBoundsX || outOfBoundsY) {
			return (outOfBoundsX || outOfBoundsY) as Point;
		} else if (outOfBounds) {
			throw new Error('what');
		}

		return null;
	}

	// TODO: If same position, do nothing.
	move (to: XYZ, feedrate?: number): Block {
		this.checkOutOfBounds(to);
		this.updatePosition(to);

		return super.move(to, feedrate);
	}

	// TODO: If same position, do nothing.
	moveRapid (to: XYZ, feedrate?: number): Block {
		this.checkOutOfBounds(to);
		this.updatePosition(to);

		return super.moveRapid(to, feedrate);
	}

	checkMove(to: Point): { to: Point, corrected: boolean } {
		const outOfBoundPosition = this.getOutOfBoundPosition(to);

		if (!outOfBoundPosition) {
			return { to, corrected: false };
		}

		return {
			to: outOfBoundPosition,
			corrected: true,
		};
	}

	// TODO: No support for Z bounds
	protected checkOutOfBounds (to: XYZ): void {
		const newPos = this.getNewPosition(to);

		if (this.getOutOfBoundPosition(newPos)) {
			throw new Error(`Moved out of bounds: X${newPos.x} Y${newPos.y}`);
		}
	}

	protected getNewPosition (to: XYZ): Point {
		return new Point(
			isSet(to.x) ? to.x : this.pos.x,
			isSet(to.y) ? to.y : this.pos.y,
		);
	}

	// TODO: No support for Z position
	updatePosition (newPosition: XYZ): void {
		const newPos = this.getNewPosition(newPosition);
		console.log('Moving machine', {from: this.pos, to: newPos});
		this.pos = new Point(newPos.x, newPos.y);
	}
}
