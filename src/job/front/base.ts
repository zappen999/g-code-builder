/**
 * Base job, should include everything generic to engraving, cutouts, hole
 *
 * making etc.
 */
import { Program, Block } from 'lib/index';
import { BaseJob, MachineParams } from 'job/index';

export interface FrontParams {
	width: number;
	height: number;
	thickness: number;
}

export abstract class BaseFront extends BaseJob {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: FrontParams,
	) {
		super(machineParams);
	}

	build (): Program {
		return super
			.build()
			.addBlock(new Block()
				.comment(`Front params: ${JSON.stringify(this.frontParams)}`)
			);
	}
}
