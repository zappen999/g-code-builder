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
		// TODO: This should be added at the very end, like a destructor
		// program.addBlock(this.getTeardownBlock());

		return program;
	}

	safeTravel (
		to: XYZ & Required<Pick<XYZ, 'x' | 'y'>>,
		slowdownMargin = 3
	): Block {
		const block = new Block();
		const toZ = to.z || 0;
		const { feedrate, rapidFeedrate } = this.machineParams;

		block.moveRapid({ z: this.machineParams.safeHeight }, rapidFeedrate);
		block.moveRapid({ x: to.x, y: to.y }, rapidFeedrate);
		block.moveRapid({ z: toZ + slowdownMargin }, rapidFeedrate);
		block.move({ z: toZ }, feedrate);

		return block;
	}

	getSetupBlock (): Block {
		const { feedrate, rapidFeedrate, safeHeight } = this.machineParams;

		return new Block()
			.setPlane(Plane.XY)
			.setAbsolutePositioning()
			.setUnits(Unit.MILLIMETERS)
			.setCoordinateSystem(CoordinateSystem.G54)
			.moveRapid({ z: safeHeight * 5 }, rapidFeedrate)
			.move({ x: 0, y: 0, z: safeHeight }, feedrate)
			.comment(`Machine params: ${JSON.stringify(this.machineParams)}`)
			.comment('End setup');
	}

	getTeardownBlock (): Block {
		const { rapidFeedrate, safeHeight } = this.machineParams;

		return new Block()
			.comment('Start teardown')
			.moveRapid({ z: safeHeight * 5 }, rapidFeedrate)
			.stopSpindle()
			.moveRapid({ x: 0, y: 0 }, rapidFeedrate)
			.end()
			.comment('End teardown');
	}
}
