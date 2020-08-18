import type { MachineParams } from './types';
import {
	Program,
	Block,
	Plane,
	Unit,
	CoordinateSystem,
	XYZ,
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

	safeTravel (
		to: XYZ & Required<Pick<XYZ, 'x' | 'y'>>,
		slowdownMargin = 3
	): Block {
		const block = new Block();

		const toZ = to.z || 0;

		block.moveRapid({ z: this.machineParams.safeHeight });
		block.moveRapid({ x: to.x, y: to.y });
		block.moveRapid({ z: toZ + slowdownMargin });
		block.move({ z: toZ });

		return block;
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
}
