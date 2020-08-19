import {
	Block,
	Dir,
	Point,
    HelpInfo,
} from 'lib/index';
import type { MachineParams, ToolController } from 'job/index';
import type { FrontParams } from 'job/front/index';
import { BaseFront } from 'job/front/index';

export interface FrontEngraveParams extends FrontParams {
	engrave: {
		ctrl: ToolController;
		depth: number;
	};
	chamfer?: {
		ctrl: ToolController;
		cornerRadius: number;
	};
}

export abstract class BaseFrontEngrave extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected help: HelpInfo,
		protected frontParams: FrontEngraveParams,
	) {
		super(machineParams, help, frontParams);
	}

	build (): Block {
		const block = new Block();

		block
			.startSpindle(Dir.CW, this.frontParams.engrave.ctrl.spindleSpeed);

		if (this.frontParams.chamfer) {
			block.merge(this.getChamferBlock());
		}

		return block;
	}

	travelToEngrave (
		block: Block,
		to: Point,
		depth = this.frontParams.engrave.depth
	): Block {
		return block
			.moveRapid({ z: this.machineParams.safeHeight })
			.moveRapid({ x: to.x, y: to.y })
			.move({ z: -depth }, this.frontParams.engrave.ctrl.feedrate);
	}

	getChamferBlock (): Block {
		const block = new Block();

		block.comment('Start chamfer')
		this.travelToEngrave(block, new Point(0, 0));

		return block
			.move({ x: -this.frontParams.width })
			.move({ y: -this.frontParams.height })
			.move({ x: 0 })
			.move({ y: 0 })
			.moveRapid({ z: this.machineParams.safeHeight * 4 })
			.comment('End chamfer');
	}
}
