import { BaseFrontEngrave, DEFAULT_MACHINE_PARAMS } from './base';
import { Block, Dir } from '../../lib';

import type { MachineParams, FrontParams } from '../types';
import { FitDimension } from '../enums';

export interface FishFrontParams extends FrontParams {
	fitDimension: FitDimension;
	patternRepeatCount: number;
}

export class FishFrontEngrave extends BaseFrontEngrave {
	constructor (
		protected frontParams: FishFrontParams,
		protected machineParams: MachineParams = DEFAULT_MACHINE_PARAMS,
	) {
		super(frontParams, machineParams);
	}

	getPatternBlock (): Block {
		const {
			patternSize: pSize,
			rows,
			columns,
		} = this.getPatternSize();
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

				const part = new Block();

				part.comment(`POS:${row}X${col}`);

				if (isFirstColumn) {
					part
						.comment('Bring down slowly to start cutting')
						.move({ z: 0 });
				}

				if (isRowOffset) {
					if (isFirstColumn) {
						part
							.comment('Make starting half arc')
							.arc({
								dir: Dir.CW,
								end: {
									x: colOffset,
									y: -(pSizeHalf * (row - 1)),
								},
								around: {
									x: 0,
									y: pSizeHalf,
								},
								feedrate: this.machineParams.feedrate,
							});
					} else if (isLastColumn) {
						part
							.comment('Make ending half arc')
							.arc({
								dir: Dir.CW,
								end: {
									x: -(pSize * col),
									y: -(pSizeHalf * row),
								},
								around: {
									x: -pSizeHalf,
									y: 0,
								},
								feedrate: this.machineParams.feedrate,
							});
					}
				}

				if (!(isLastColumn && isRowOffset)) {
					part
						.comment(`Full arc WITH${isRowOffset ? '' : 'OUT'} offset`)
						.arc({
							dir: Dir.CW,
							end: {
								x: -(pSize * col) + colOffset,
								y: -(pSizeHalf * (row - 1)),
							},
							around: {
								x: -(pSizeHalf),
								y: 0,
							},
							feedrate: this.machineParams.feedrate,
						});
				}

				if (isLastRow && isLastColumn) {
					part
						.comment('All rows and cols finished, go to origin')
						.moveRapid({ z: this.machineParams.safeHeight })
						.moveRapid({ x: 0, y: 0 });
				} else if (isLastColumn) {
					part
						.comment(`End of cols, move to next row: ${isRowOffset ? 'no offset' : 'offset'}`)
						.moveRapid({ z: this.machineParams.safeHeight })
						.moveRapid({
							x: 0,
							y: -(isNextRowOffset
								? (pSizeHalf * row) + pSizeHalf
								: pSizeHalf * row),
						});
				}

				patternBlock.addBlock(part);
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
