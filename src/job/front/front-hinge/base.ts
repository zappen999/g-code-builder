import { BaseFront } from 'job/front/index';
import type { Program } from 'lib/index';
import type { MachineParams } from 'job/index';
import type { FrontParams } from 'job/front/index';
import type { Point, AxisDir } from 'lib/index';
import type { ToolController } from 'job/index';
import { BoreFactory, Bore } from 'factory/index';

export interface HingePosition {
	pos: Point;
	dir: AxisDir;
}

// TODO: HingePosition -> Hinge, and include size of hinge holes?
export interface BaseFrontHingeParams extends FrontParams {
	hinge: {
		positions: HingePosition[];
		ctrl: ToolController;
	}
}

export class BaseHinge extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: BaseFrontHingeParams,
	) {
		super(machineParams, frontParams);
	}

	build (): Program {
		const program = super.build();

		// TODO: params instead
		const bore: Bore = { diameter: 30, depth: 14 };
		const ctrl: ToolController = {
			tool: {
				id: 1,
				name: 'End mill 6 mm',
				diameter: 6,
			},
			feedrate: 600,
			spindleSpeed: 24000,
			stepdown: 6,
			stepover: 3,
		};

		const boreFactory = new BoreFactory(bore, ctrl);
		const boreBlock = boreFactory.build();

		program.addBlock(boreBlock);

		return program;
	}
}
