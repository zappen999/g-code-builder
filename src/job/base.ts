import type { ToolController, MachineParams } from './types';
import {
	Program,
	Block,
	Plane,
	Unit,
	CoordinateSystem,
} from 'lib/index';

export abstract class BaseJob {
	constructor (
		protected machineParams: MachineParams
	) { }

	build (): Program {
		const program = new Program();

		program.addBlock(this.getSetupBlock());
		program.addBlock(this.getTeardownBlock());

		return program;
	}

	getSetupBlock (): Block {
		return new Block()
			.setPlane(Plane.XY)
			.setAbsolutePositioning()
			.setUnits(Unit.MILLIMETERS)
			.setCoordinateSystem(CoordinateSystem.G54)
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.move({ x: 0, y: 0, z: this.machineParams.safeHeight })
			.comment(`Machine params: ${JSON.stringify(this.machineParams)}`)
			.comment('End setup');
	}

	getTeardownBlock (): Block {
		return new Block()
			.comment('Start teardown')
			.moveRapid({ z: this.machineParams.safeHeight * 5 })
			.stopSpindle()
			.moveRapid({ x: 0, y: 0 })
			.end()
			.comment('End teardown');
	}

	getStepdownDepths (
		toolCtrl: ToolController,
		thickness: number
	): number[] {
		const passes = Math.ceil(thickness / toolCtrl.stepdown);
		const perPass = thickness / passes;

		const depths: number[] = [];

		for (let depth = -perPass; depth >= -thickness; depth -= perPass) {
			depths.push(depth);
		}

		return depths;
	}
}
