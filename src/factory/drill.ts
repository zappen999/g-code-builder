import type { ToolController } from 'job/index';
import { Block, getStepdownDepths } from 'lib/index';

export interface Hole {
	depth: number;
}

export class DrillFactory {
	constructor (
		protected hole: Hole,
		protected ctrl: ToolController,
		protected safeHeight = 2,
	) { }

	build (): Block {
		const block = new Block();
		const depths = getStepdownDepths(this.ctrl, this.hole.depth);

		for (let i = 0; i < depths.length; i++) {
			const depth = depths[i];
			const isFinalDepth = i === depths.length - 1;

			block
				.move({ z: depth }, this.ctrl.feedrate)
				// TODO: What rapid speed?
				.moveRapid({ z: 0 });

			if (!isFinalDepth) {
				block.moveRapid({ z: depth + this.safeHeight });
			}
		}

		return block;
	}
}
