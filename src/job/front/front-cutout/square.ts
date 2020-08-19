import { Block } from 'lib/index';
import { MachineParams, getStepdownDepths } from 'job/index';
import { BaseFrontCutout, FrontCutoutParams } from './base';
import * as assert from 'assert';

export type SquareFrontCutoutParams = FrontCutoutParams;

export class SquareFrontCutout extends BaseFrontCutout {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: SquareFrontCutoutParams,
	) {
		super(machineParams, frontParams);

		this.addDocs('This will make a square cutout of the front');
		this.addDocs('It compensates for the tool radius');
	}

	build (): Block {
		const { cutout, thickness } = this.frontParams;

		assert.ok(cutout, 'Cutout params must exist for cutout');

		const block = super.build();
		const toolRadius = this.getToolRadius(cutout.ctrl.tool);
		const depths = getStepdownDepths(
			cutout.ctrl,
			thickness
		);

		let i = 0;

		for (const depth of depths) {
			const pass = new Block();
			pass
				.comment(`Doing pass ${i++} of ${depths.length}`)
				.move({ z: depth })
				.move({ x: -this.frontParams.width - toolRadius })
				.move({ y: -this.frontParams.height - toolRadius })
				.move({ x: toolRadius })
				.move({ y: toolRadius })
			block.merge(pass);
		}

		block
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.comment('End cutout');

		return block;
	}
}
