import { BaseFrontEngrave, DEFAULT_MACHINE_PARAMS } from './base';
import { BoundedBlock, Block, Point } from '../../lib';

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
		const {
			width,
			height,
			patternWidth,
			patternHeightMultiplier
		} = this.frontParams;
		const block = new BoundedBlock(width, height);

		const xStep = -patternWidth;
		const xForHeight = height / patternHeightMultiplier;

		let direction: 'up' | 'down' = 'down';
		let i = 0;

		while (1) {
			block.comment(`-------- ${direction.toUpperCase()} ---------`);

			const xOffset = i * xStep;
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
