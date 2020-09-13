import type { ToolController } from 'job/index';
import { Block, Point, Dir, getStepdownDepths  } from 'lib/index';

export interface Bore {
	diameter: number;
	depth: number;
}

const CENTER = new Point(0, 0);
const ONE_TURN_RADS = Math.PI * 2;

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
		protected thetaStep = 0.05,
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
		let pos = new Point(0, 0);

		for (let theta = 0;; theta += this.thetaStep) {
			const revolutions = theta / ONE_TURN_RADS;
			const distanceFromCenter = CENTER.distanceTo(pos);

			if (distanceFromCenter > this.maxTravel) {
				const prevTheta = theta - this.thetaStep;
				const nearestPointOnCircle = new Point(
					this.maxTravel * Math.cos(prevTheta),
					-this.maxTravel * Math.sin(prevTheta),
				);

				block
					.move({ ...nearestPointOnCircle }, this.ctrl.feedrate)
					.arc({
						dir: Dir.CW,
						end: nearestPointOnCircle,
						around: new Point(
							-nearestPointOnCircle.x,
							-nearestPointOnCircle.y,
						),
						feedrate: this.ctrl.feedrate,
					})
					.moveRapid({ ...CENTER });
				break;
			}

			const spiralEffect = revolutions * this.stepover;

			pos = new Point(
				spiralEffect * Math.cos(-theta),
				spiralEffect * Math.sin(-theta),
			);

			block.move({ ...pos }, this.ctrl.feedrate);
		}

		return block;
	}
}
