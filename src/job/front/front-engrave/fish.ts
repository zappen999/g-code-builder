import { BaseFrontEngrave, FrontEngraveParams } from './base';
import { Program, Block, Dir, Point } from 'lib/index';

import type { MachineParams } from 'job/index';
import { FitDimension } from 'job/index';

export interface FishFrontEngraveParams extends FrontEngraveParams {
	fitDimension: FitDimension;
	patternRepeatCount: number;
}

export class FishFrontEngrave extends BaseFrontEngrave {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: FishFrontEngraveParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Program {
		const program = super.build();

		program.addBlock(this.getPatternBlock());

		return program;
	}

	getPatternBlock (): Block {
		const {
			patternSize: pSize,
			rows,
			columns,
		} = this.getPatternSize();
		const { engrave } = this.frontParams;
		const pSizeHalf = pSize / 2;

		const patternBlock = new Block();
		patternBlock.comment(
			`Pattern setup: ${JSON.stringify({ pSize, rows, columns })}`
		);

		for (let row = 1; row <= rows; row++) {
			const isLastRow = row === rows;
			const isRowOffset = !(row % 2);
			const colOffset = isRowOffset ? -pSizeHalf : 0;
			const isNextRowOffset = !isRowOffset;

			for (let col = 1; col <= columns; col++) {
				const isFirstColumn = col === 1;
				const isLastColumn = col === columns;

				patternBlock.comment(`POS:${row}X${col}`);

				if (isFirstColumn) {
					patternBlock
						.comment('Bring down slowly to start cutting')
						.move({ z: 0 });
				}

				if (isRowOffset) {
					if (isFirstColumn) {
						patternBlock
							.comment('Make starting half arc')
							.arc({
								dir: Dir.CW,
								end: new Point(
									colOffset,
									-(pSizeHalf * (row - 1))
								),
								around: new Point(
									0,
									pSizeHalf,
								),
								feedrate: engrave.ctrl.feedrate,
							});
					} else if (isLastColumn) {
						patternBlock
							.comment('Make ending half arc')
							.arc({
								dir: Dir.CW,
								end: new Point(
									-(pSize * col),
									-(pSizeHalf * row),
								),
								around: new Point(
									-pSizeHalf,
									0,
								),
								feedrate: engrave.ctrl.feedrate,
							});
					}
				}

				if (!(isLastColumn && isRowOffset)) {
					patternBlock
						.comment(`Full arc WITH${isRowOffset ? '' : 'OUT'} offset`)
						.arc({
							dir: Dir.CW,
							end: new Point(
								-(pSize * col) + colOffset,
								-(pSizeHalf * (row - 1)),
							),
							around: new Point(
								-(pSizeHalf),
								0,
							),
							feedrate: engrave.ctrl.feedrate,
						});
				}

				if (isLastRow && isLastColumn) {
					patternBlock
						.comment('All rows and cols finished, go to origin')
						.moveRapid({ z: this.machineParams.safeHeight })
						.moveRapid({ x: 0, y: 0 });
				} else if (isLastColumn) {
					patternBlock
						.comment(`End of cols, move to next row: ${isRowOffset ? 'no offset' : 'offset'}`)
						.moveRapid({ z: this.machineParams.safeHeight })
						.moveRapid({
							x: 0,
							y: -(isNextRowOffset
								? (pSizeHalf * row) + pSizeHalf
								: pSizeHalf * row),
						});
				}
			}
		}

		return patternBlock;
	}

	protected getPatternSize (): {
		patternSize: number;
		rows: number;
		columns: number;
	} {
		const {
			width,
			height,
			fitDimension,
			patternRepeatCount,
		} = this.frontParams;

		if (fitDimension === FitDimension.HORIZONTAL) {
			const patternSize = width / patternRepeatCount;

			return {
				patternSize,
				rows: Math.floor(height * 2 / patternSize),
				columns: patternRepeatCount,
			};
		} else if (fitDimension === FitDimension.VERTICAL) {
			const patternSize = height * 2 / patternRepeatCount;

			return {
				patternSize,
				rows: patternRepeatCount,
				columns: Math.floor(width / patternSize),
			};
		}

		throw new Error(`Unsupported fit dimension: ${fitDimension}`);
	}
}
