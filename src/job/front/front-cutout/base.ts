import { Block, Program, AxisDir } from 'lib/index';
import {
	BaseFront,
	FrontParams,
} from 'job/front/index';
import type { MachineParams, Tool, ToolController } from 'job/index';
import * as assert from 'assert';

export interface FrontCutoutParams extends FrontParams {
	cutout: {
		ctrl: ToolController;
		probeBed: boolean;
	};
}

export abstract class BaseFrontCutout extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: FrontCutoutParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Program {
		const program = new Program();
		const { cutout } = this.frontParams;

		assert.ok(cutout, 'Cutout params must exist for cutout');

		const { ctrl, probeBed } = cutout;
		const { tool } = ctrl;

		program.addBlock(new Block()
			.comment('Change to cutout tool')
			.changeTool(tool.name, tool.id)
		);

		if (probeBed) {
			program.addBlock(this.probeAgainstWorkbedSurface());
		}

		program.addBlock(this.rapidToCutoutPosition());

		return program;
	}

	probeAgainstWorkbedSurface (): Block {
		const { machineParams } = this;
		const { workBedSurface } = machineParams.probe.positions;

		return new Block()
			.comment('Starting zero against workbed surface')
			.moveRapid(workBedSurface.pos, this.machineParams.rapidFeedrate)
			.stop()
			.setRelativePositioning()
			.probe({
				mode: 'towards',
				action: 'stop_or_error',
				feedrate: this.machineParams.probe.feedrate,
				maxTravel: this.machineParams.probe.maxTravel,
				axis: AxisDir.Z_NEG,
			})
			.comment('Setting new tool zero')
			// TODO: Implement G10 in API
			.raw(`G10 L20 Z${workBedSurface.touchPlaceThickness}`)
			.comment('Back off from touch plate')
			.moveRapid({ z: 20 })
			.setAbsolutePositioning()
			.comment('Completed workbed zero, remove touch plate')
			.stop();
	}

	rapidToCutoutPosition (): Block {
		const { cutout, thickness } = this.frontParams;
		const { safeHeight } = this.machineParams;
		assert.ok(cutout);

		const { ctrl, probeBed } = cutout;
		const { tool } = ctrl;
		const toolRadius = this.getToolRadius(tool);

		return new Block()
			.comment('Move into position for cutout')
			.moveRapid({
				x: toolRadius,
				y: toolRadius,
				z: probeBed
					? thickness + safeHeight
					: safeHeight,
			});
	}

	getToolRadius (tool: Tool): number {
		return tool.diameter / 2;
	}
}
