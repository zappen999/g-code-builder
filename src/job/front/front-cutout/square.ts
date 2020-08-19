import { Block, HelpInfo } from 'lib/index';
import { MachineParams, getStepdownDepths } from 'job/index';
import { BaseFrontCutout, FrontCutoutParams } from './base';
import * as assert from 'assert';

export type SquareFrontCutoutParams = FrontCutoutParams;

export class SquareFrontCutout extends BaseFrontCutout {
	constructor (
		protected machineParams: MachineParams,
		protected help: HelpInfo,
		protected frontParams: SquareFrontCutoutParams,
	) {
		super(machineParams, help, frontParams);
	}

	build (): Block {
		const { cutout, thickness } = this.frontParams;

		assert.ok(cutout, 'Cutout params must exist for cutout');

		const block = new Block();
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
