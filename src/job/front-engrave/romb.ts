import { BaseFrontEngrave, DEFAULT_MACHINE_PARAMS } from './base';
import { Block, XYZ } from '../../lib';

import type { MachineParams, FrontParams } from '../types';

export interface RombFrontParams extends FrontParams {
	patternWidth: number;
	patternHeightMultiplier: number;
}

class Point {
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

class Line {
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

class BoundedBlock extends Block {
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
			typeof to.x !== 'undefined' ? to.x : this.pos.x,
			typeof to.y !== 'undefined' ? to.y : this.pos.y,
		);
	}

	// TODO: No support for Z position
	updatePosition (newPosition: XYZ): void {
		const newPos = this.getNewPosition(newPosition);
		console.log('Moving machine', {from: this.pos, to: newPos});
		this.pos = new Point(newPos.x, newPos.y);
	}
}

export class RombFrontEngrave extends BaseFrontEngrave {
	constructor (
		protected frontParams: RombFrontParams,
		protected machineParams: MachineParams = DEFAULT_MACHINE_PARAMS,
	) {
		super(frontParams, machineParams);
	}

	protected travel(block: Block, to: Point): Block {
		return block
			.moveRapid({ z: this.machineParams.safeHeight })
			.moveRapid({ x: to.x, y: to.y })
			.move({ z: 0 })
	}

	getPatternBlock (): Block {
		const { width, height } = this.frontParams;

		const block = new BoundedBlock(width, height);

		const yRatio = this.frontParams.patternHeightMultiplier;
		const patternWidth = this.frontParams.patternWidth;

		const getX = (y: number): number => y / yRatio;

		let direction: 'up' | 'down' = 'down';
		let i = 0;

		while (1) {
			block.comment(`-------- ${direction.toUpperCase()} ---------`);

			const xStep = -patternWidth;
			const xOffset = i * xStep;
			const xForHeight = getX(height);
			const xStepBottomOffset = xOffset + xForHeight;
			const xStepTopOffset = xOffset;

			if (direction === 'down') {
				const draftMove = new Point(xStepBottomOffset, -height);
				const { corrected, to } = block.checkMove(draftMove);

				if (corrected) {
					if (to.isEqual(block.pos)) {
						console.log('bounded to same pos, moving one step to the left');
						this.travel(block, new Point(xOffset - patternWidth, 0));
					} else {
						block.comment('Doing bounded move');
						block.move(to);
						block.comment('Moving to next top');
						this.travel(block, new Point(xOffset - patternWidth, 0));
					}
				} else {
					block.comment('Full down cut');
					block.move(to);
					block.comment('Moving to next bottom from down move');
					this.travel(block, new Point(xStepBottomOffset - patternWidth, -height));
					direction = 'up';
				}
			} else {
				const draftMove = new Point(xStepTopOffset, 0);
				const { corrected, to } = block.checkMove(draftMove);

				if (corrected) {
					if (to.isEqual(block.pos)) {
						block.comment('Done cutting since we are bounded in bottom left corner');
						this.travel(block, new Point(0, 0));
						break;
					} else {
						block.comment('Doing bounded move upwards');
						const from = block.pos;
						block.move(to);
						block.comment('Moving to next bottom from upward move');

						const spaceLeft = width + from.x;

						if (spaceLeft > patternWidth) {
							this.travel(
								block,
								new Point(from.x - patternWidth, -height)
							);
						} else {
							block.comment(
								'Theres no space left for another pass'
							);
							break;
						}
					}
				} else {
					block
						.comment('Full up cut')
						.move(to);

					const draftTravel = new Point(
						xStepTopOffset - patternWidth,
						0,
					);

					const {
						corrected: travelCorrected,
					} = block.checkMove(draftTravel);

					if (travelCorrected) {
						block.comment('Cannot move to next top position, move down to next');
						this.travel(
							block,
							new Point(xStepBottomOffset - patternWidth, -height)
						);
					} else {
						block.comment('Moving to next top');
						this.travel(
							block,
							new Point(xStepTopOffset - patternWidth, 0)
						);
						direction = 'down';
					}
				}
			}

			i++;
		}

		this.travel(block, new Point(0, 0));

		return block;
	}
}
