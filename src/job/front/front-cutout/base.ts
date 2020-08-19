import { Block, AxisDir, XYZ } from 'lib/index';
import {
	BaseFront,
	FrontParams,
} from 'job/front/index';
import type { MachineParams, ToolController } from 'job/index';
import * as assert from 'assert';

export interface FrontCutoutParams extends FrontParams {
	cutout: {
		ctrl: ToolController;
		// Zero Z against the working bed (to avoid cutting into wasteboard)
		bedProbe?: {
			pos: Required<XYZ>;
			touchPlaceThickness: number;
		},
	};
}

export abstract class BaseFrontCutout extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: FrontCutoutParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Block {
		const { cutout } = this.frontParams;

		assert.ok(cutout, 'Cutout params must exist for cutout');

		const { ctrl, bedProbe } = cutout;
		const { tool } = ctrl;

		const block = new Block()
			.comment('Change to cutout tool')
			.changeTool(tool.name, tool.id);

		if (bedProbe) {
			const { x, y, z } = bedProbe.pos;
			this.addDocs(
				'The program will pause to probe against the workbed surface ' +
				`from X${x} Y${y} Z${z} with a probe-plate thickness of ` +
				`${bedProbe.touchPlaceThickness}mm. This is done to spare ` +
				'the wasteboard during cutout. Note that the zero will be ' +
				'lost after this job',
			);
			block.merge(this.probeAgainstWorkbedSurface());
		}

		return block.merge(this.rapidToCutoutPosition());
	}

	probeAgainstWorkbedSurface (): Block {
		const { bedProbe } = this.frontParams.cutout;
		assert.ok(bedProbe);

		return new Block()
			.comment('Starting zero against workbed surface')
			.moveRapid(bedProbe.pos, this.machineParams.rapidFeedrate)
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
			.raw(`G10 L20 Z${bedProbe.touchPlaceThickness}`)
			.comment('Back off from touch plate')
			.moveRapid({ z: 20 })
			.setAbsolutePositioning()
			.comment('Completed workbed zero, remove touch plate')
			.stop();
	}

	rapidToCutoutPosition (): Block {
		const { cutout, thickness } = this.frontParams;
		const { safeHeight } = this.machineParams;

		const { ctrl, bedProbe } = cutout;
		const { tool } = ctrl;
		const toolRadius = this.getToolRadius(tool);

		return new Block()
			.comment('Move into position for cutout')
			.moveRapid({
				x: toolRadius,
				y: toolRadius,
				z: bedProbe
					? thickness + safeHeight
					: safeHeight,
			});
	}
}
