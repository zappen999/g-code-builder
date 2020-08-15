import { BaseFront } from 'job/front/index';
import { Program, Block } from 'lib/index';
import type { MachineParams } from 'job/index';
import type { FrontParams } from 'job/front/index';
import type { Point, AxisDir } from 'lib/index';
import type { ToolController } from 'job/index';
import { BoreFactory, Bore, DrillFactory, Hole } from 'factory/index';

export interface Hinge {
	pos: Point;
	dir: AxisDir;
}

export interface BaseFrontHingeParams extends FrontParams {
	hinge: {
		hinges: Hinge[];
		ctrl: ToolController;
	}
}

// TODO: This class is specific to IKEA-type hinges. This class should only
// contain generic hinge-functionality.
export class BaseHinge extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: BaseFrontHingeParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Program {
		const program = super.build();
		const { hinges } = this.frontParams.hinge;

		for (const hinge of hinges) {
			// TODO: Rapid to center position of hinge
			this.addHingeBlock(hinge);
		}

		// this.buildBoreBlock(program);
		this.buildDrillBlock(program);

		return program;
	}

	// TODO: Take real measurements to get positions of skrew holes.
	// https://i.pinimg.com/originals/de/29/fa/de29faef6358c9236b2963ad560f4722.jpg
	addHingeBlock (program: Program, hinge: Hinge): void {
		const block = new Block();

		// Make hinge bore at center (where we are)
		// Rapid to first hole position (depending on direction)
		// drill
		// Rapid to second hole position (depending on direction)
		// drill

		program.addBlock(block);
	}

	buildDrillBlock (program: Program): void {
		const hole: Hole = { depth: 30 };
		const ctrl: ToolController = {
			tool: {
				id: 1,
				name: 'End mill 6 mm',
				diameter: 6,
			},
			feedrate: 600,
			spindleSpeed: 24000,
			stepdown: 10,
		};

		const drillFactory = new DrillFactory(hole, ctrl);

		program.addBlock(drillFactory.build());
	}
}
