import { BaseFrontEngrave, DEFAULT_MACHINE_PARAMS } from './base';
import { Block, Point } from '../../lib';

import type { MachineParams, FrontParams } from '../types';

export interface RombFrontParams extends FrontParams {
	patternWidth: number;
	patternHeightMultiplier: number;
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
		const leftLeaning = this.makeZigZag('left');
		const rightLeaning = this.makeZigZag('right');

		leftLeaning.addBlock(rightLeaning);
		return leftLeaning;
	}

	makeZigZag (leaning: 'left' | 'right'): Block {
		const block = new Block();
		const isLeft = leaning === 'left';

		let isUpper = true;

		const upperPoints = this.getUpperPoints();
		const lowerPoints = this.getLowerPoints();

		const getNextLowerPoint = () => {
			const lp = lowerPoints.shift();

			if (!lp) {
				return;
			}

			return isLeft ? lp : this.mirrorPointVertically(lp);
		};

		const getNextUpperPoint = () => {
			const up = upperPoints.shift();

			if (!up) {
				return
			}

			return isLeft ? up : this.mirrorPointVertically(up);
		};

		while (upperPoints.length && lowerPoints.length) {
			if (isUpper) {
				const upperTravel = getNextUpperPoint();
				console.log({ upperTravel });

				if (upperTravel) this.travel(block, upperTravel);

				const lowerCut = getNextLowerPoint();
				console.log({ lowerCut });

				if (lowerCut) block.move(lowerCut);
			} else {
				const lowerTravel = getNextLowerPoint();
				console.log({ lowerTravel });

				if (lowerTravel) this.travel(block, lowerTravel);

				const upperCut = getNextUpperPoint();
				console.log({ upperCut });

				if (upperCut) block.move(upperCut);

			}

			isUpper = !isUpper;
		}

		return block;
	}

	mirrorPointVertically (p: Point): Point {
		const { height } = this.frontParams;
		return new Point(p.x, -height - p.y);
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
