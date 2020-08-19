/**
 * Base job, should include everything generic to engraving, cutouts, hole
 *
 * making etc.
 */
import { Block } from 'lib/index';
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

		this.addDocs('Origin is at the top right corner of the finished front');
	}

	build (): Block {
		return new Block()
			.comment(`Front params: ${JSON.stringify(this.frontParams)}`);
	}
}
