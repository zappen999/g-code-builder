import type { ToolController } from 'job/index';
import { Block, Point, Dir, getStepdownDepths  } from 'lib/index';

export interface Bore {
	diameter: number;
	depth: number;
}

// This job has it's own 'origin', it's up to the caller to offset the block to
// wherever it's supposed to be in the program.
export class BoreFactory {
	protected boreRadius: number;
	protected toolRadius: number;
	protected maxTravel: number;
	protected stepover: number;

	constructor (
		protected bore: Bore,
		protected ctrl: ToolController,
	) {
		// For convenience
		this.boreRadius = this.bore.diameter / 2;
		this.toolRadius = this.ctrl.tool.diameter / 2;
		this.maxTravel = this.boreRadius - this.toolRadius;
		this.stepover = this.ctrl.stepover || this.ctrl.tool.diameter;
	}

	build (): Block {
		const block = new Block();
		const depths = getStepdownDepths(this.ctrl, this.bore.depth);

		for (const depth of depths) {
			block.move({ z: depth }, this.ctrl.feedrate);
			this.makeSpiral(block);
		}

		block.moveRapid({ z: 0 });

		return block;
	}

	protected makeSpiral (block: Block): Block {
		const passes = Math.ceil(this.boreRadius / this.stepover);

		for (let i = 1; i <= passes; i++) {
			const lastPass = passes === i;

			const b = new Block()
				.comment('Go to the top')
				.move({ x: 0, y: this.maxTravel }, this.ctrl.feedrate)
				.comment('Arc from 0 -> 90 deg')
				.arc({
					dir: Dir.CW,
					end: { x: this.maxTravel, y: 0 },
					around: new Point(0, -this.maxTravel),
					feedrate: this.ctrl.feedrate,
				})
				.comment('Arc from 90 -> 180 deg')
				.arc({
					dir: Dir.CW,
					end: { x: 0, y: -this.maxTravel },
					around: new Point(-this.maxTravel, 0),
					feedrate: this.ctrl.feedrate,
				})
				.comment('Arc from 180 -> 270 deg')
				.arc({
					dir: Dir.CW,
					end: { x: -this.maxTravel, y: 0 },
					around: new Point(0, this.maxTravel),
					feedrate: this.ctrl.feedrate,
				})
				.comment('Arc from 270 -> 360 deg')
				.arc({
					dir: Dir.CW,
					end: { x: 0, y: this.maxTravel },
					around: new Point(this.maxTravel, 0),
					feedrate: this.ctrl.feedrate,
				});

			if (lastPass) {
				b
					.comment('Move to middle')
					.moveRapid({ x: 0, y: 0 });
			}

			const scale = i / passes;
			b.scale({ x: scale, y: scale });
			block.merge(b);
		}

		return block;
	}
}
