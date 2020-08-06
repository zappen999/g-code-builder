import { BaseFrontEngrave, FrontEngraveParams } from './base';
import { Program, Block, Point } from 'lib/index';
import type { MachineParams } from 'job/index';

export interface RombFrontEngraveParams extends FrontEngraveParams {
	patternWidth: number;
	patternHeightMultiplier: number;
}

export class RombFrontEngrave extends BaseFrontEngrave {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: RombFrontEngraveParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Program {
		const program = super.build();

		program.addBlock(this.getPatternBlock());

		return program;
	}

	getPatternBlock (): Block {
		const block = new Block();
		this.makeZigZag(block, 'left');
		this.makeZigZag(block, 'right');
		return block;
	}

	makeZigZag (block: Block, leaning: 'left' | 'right'): void {
		const { engrave } = this.frontParams;
		const isLeft = leaning === 'left';

		let isUpper = true;

		const upperPoints = this.getUpperPoints();
		const lowerPoints = this.getLowerPoints();

		const getNextLowerPoint = () => {
			const lp = lowerPoints.shift();

			if (!lp) {
				return;
			}

			return isLeft ? lp : this.mirrorPointHorzontally(lp);
		};

		const getNextUpperPoint = () => {
			const up = upperPoints.shift();

			if (!up) {
				return
			}

			return isLeft ? up : this.mirrorPointHorzontally(up);
		};

		while (upperPoints.length && lowerPoints.length) {
			if (isUpper) {
				const upperTravel = getNextUpperPoint();

				if (upperTravel) this.travelToEngrave(block, upperTravel);

				const lowerCut = getNextLowerPoint();

				if (lowerCut) block.move(lowerCut, engrave.ctrl.feedrate);
			} else {
				const lowerTravel = getNextLowerPoint();

				if (lowerTravel) this.travelToEngrave(block, lowerTravel);

				const upperCut = getNextUpperPoint();

				if (upperCut) block.move(upperCut, engrave.ctrl.feedrate);

			}

			isUpper = !isUpper;
		}
	}

	mirrorPointHorzontally (p: Point): Point {
		const { width } = this.frontParams;
		return new Point(-width - p.x, p.y);
	}

	getUpperPoints(): Point[] {
		const { width, height, patternWidth } = this.frontParams;
		const points: Point[] = [];

		let upperX = 0;
		let upperY = 0;

		for (let i = 0;; i++) {
			if (upperX < width && upperX + patternWidth > width) {
				// No overflow, but will be with this step, how much?
				const overflowDis = upperX + patternWidth - width;

				// Add the amount that fits onto X
				upperX += width - upperX;

				// Add the overflow to Y
				// TODO: Is this safe? Maybe overflowing here too?
				upperY += this.getY(overflowDis);
			} else if (upperX + patternWidth > width) {
				// It overflows, but it aint the first time.
				const nextUpperY = upperY + this.getY(patternWidth);

				if (nextUpperY < height) {
					upperY = nextUpperY;
				} else {
					break;
				}
			} else { // No overflow
				upperX += patternWidth;
			}

			points.push(new Point(-upperX, -upperY));
		}

		return points;
	}


	getLowerPoints(): Point[] {
		const { width, height, patternWidth } = this.frontParams;
		const points: Point[] = [];

		let lowerX = 0;
		let lowerY = 0;

		const yDis = this.getY(patternWidth);

		// Lower
		for (let i = 0;; i++) {
			if (lowerY < height && lowerY + yDis > height) {
				// No overflow, but will be with this step, how much?
				const overflowDis = lowerY + yDis - height;

				// Add the amount that fits onto Y
				lowerY += height - lowerY;

				// Add the overflow to X
				lowerX += this.getX(overflowDis);
			} else if (lowerY + yDis > height) {
				// It overflows, but it aint the first time.
				const nextLowerX = lowerX + this.getX(yDis);

				if (nextLowerX < width) {
					lowerX = nextLowerX;
				} else {
					break;
				}
			} else { // No overflow
				lowerY += yDis;
			}

			points.push(new Point(-lowerX, -lowerY));
		}

		return points;
	}

	getX (y: number): number {
		return y / this.frontParams.patternHeightMultiplier;
	}

	getY (x: number): number {
		return x * this.frontParams.patternHeightMultiplier;
	}
}
