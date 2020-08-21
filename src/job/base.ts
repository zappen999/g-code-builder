import type { MachineParams, Tool } from './types';
import {
	Program,
	Block,
	Plane,
	Unit,
	CoordinateSystem,
	XYZ,
} from 'lib/index';

export abstract class BaseJob {
	protected docs: string[] = [];

	constructor (
		protected machineParams: MachineParams,
	) { }

	abstract build (): Block;

	buildProgram (): Program {
		const program = new Program();

		program.addBlock(this.getSetupBlock());
		program.addBlock(this.build());
		program.addBlock(this.getTeardownBlock());

		return program;
	}

	buildDocs (): string {
		return `
			<ul>
				${this.docs.map(d => `<li>${d}</li>`).join('\n')}
			</ul>
		`;
	}

	addDocs(message: string): void {
		this.docs.push(message);
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

	getToolRadius (tool: Tool): number {
		return tool.diameter / 2;
	}
}
