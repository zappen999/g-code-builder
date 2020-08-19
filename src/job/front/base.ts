/**
 * Base job, should include everything generic to engraving, cutouts, hole
 *
 * making etc.
 */
import { Block, HelpInfo } from 'lib/index';
import { BaseJob, MachineParams } from 'job/index';

export interface FrontParams {
	width: number;
	height: number;
	thickness: number;
}

export abstract class BaseFront extends BaseJob {
	constructor (
		protected machineParams: MachineParams,
		protected help: HelpInfo,
		protected frontParams: FrontParams,
	) {
		super(machineParams, help);
	}

	build (): Block {
		return new Block()
			.comment(`Front params: ${JSON.stringify(this.frontParams)}`);
	}
}
