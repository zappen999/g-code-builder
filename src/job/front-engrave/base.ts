/**
 * Should contain everything generic between front engraving.
 */
import {
	Block,
	Program,
	Plane,
	Unit,
	CoordinateSystem,
	Dir,
	Point,
} from '../../lib';
import type { FrontParams, MachineParams } from '../types';

export const DEFAULT_MACHINE_PARAMS = {
	feedrate: 600,
	rapidFeedrate: 10000,
	safeHeight: 10,
	spindleSpeed: 24000,
	toolDiameter: 6,
};

export abstract class BaseFrontEngrave {
	constructor (
		protected frontParams: FrontParams,
		protected machineParams: MachineParams = DEFAULT_MACHINE_PARAMS,
	) {}

	travel (
		block: Block,
		to: Point,
		depth = this.frontParams.engraveDepth
	): Block {
		return block
			.moveRapid({ z: this.machineParams.safeHeight })
			.moveRapid({ x: to.x, y: to.y })
			.move({ z: depth })
	}

	getChamferBlock (): Block {
		const block = new Block();

		block.comment('Start chamfer')

		this.travel(block, new Point(0, 0));

		return block
			.move({ x: -this.frontParams.width })
			.move({ y: -this.frontParams.height })
			.move({ x: 0 })
			.move({ y: 0 })
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.comment('End chamfer');
	}

	// TODO: Set new zero here using probe.
	// TODO: Make holding tabs?
	getCutoutBlock (): Block {
		const block = new Block();

		block.comment('Start cutout')

		const { toolDiameter } = this.machineParams;
		const toolRadius = toolDiameter / 2;

		this.travel(block, new Point(toolRadius, toolRadius), -16);

		return block
			.move({ x: -this.frontParams.width - toolRadius })
			.move({ y: -this.frontParams.height - toolRadius })
			.move({ x: toolRadius })
			.move({ y: toolRadius })
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.comment('End cutout');
	}


	build (): Program {
		const program = new Program();

		program.addBlock(this.getSetupBlock());
		program.addBlock(this.getPatternBlock());

		if (this.frontParams.doChamferEdges) {
			program.addBlock(this.getChamferBlock());
		}

		if (this.frontParams.doCutout) {
			program.addBlock(this.getCutoutBlock());
		}

		program.addBlock(this.getTeardownBlock());

		return program;
	}

	getSetupBlock (): Block {
		const setup = new Block();
		return setup
			.setPlane(Plane.XY)
			.setAbsolutePositioning()
			.setUnits(Unit.MILLIMETERS)
			.setCoordinateSystem(CoordinateSystem.G54)
			.setLinearFeedrate(this.machineParams.feedrate)
			.setRapidFeedrate(this.machineParams.rapidFeedrate)
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.startSpindle(Dir.CW, this.machineParams.spindleSpeed)
			.move({ x: 0, y: 0, z: 0 })
			.comment(`Machine params: ${JSON.stringify(this.machineParams)}`)
			.comment(`Front params: ${JSON.stringify(this.frontParams)}`)
			.comment('End setup');
	}

	getTeardownBlock (): Block {
		const teardown = new Block();
		return teardown
			.comment('Start teardown')
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.stopSpindle()
			.moveRapid({ x: 0, y: 0 })
			.end()
			.comment('End teardown');
	}

	abstract getPatternBlock(): Block;
}

