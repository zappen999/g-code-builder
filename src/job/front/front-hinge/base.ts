import { BaseFront } from 'job/front/index';
import { Program, Block, deg2rad, Dir } from 'lib/index';
import type { MachineParams } from 'job/index';
import type { FrontParams } from 'job/front/index';
import { Point, AxisDir } from 'lib/index';
import type { ToolController } from 'job/types';

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

export interface Bore {
	diameter: number;
	depth: number;
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


		const bore: Bore = {
			diameter: this.frontParams.hinge.positions[
		};
		program.addBlock(this.getBoreBlock({ }));

		return program;
	}

	getBoreBlock (bore: Bore, ctrl: ToolController): Block {
		const block = new Block()
			.comment('Spiral start');

		const ONETURN = Math.PI * 2;

		// PI = 180
		// PI/4 = 180/4 = 45

		// https://www.youtube.com/watch?v=JmLN3QxshlE
		// 1 turn == 360deg == 2PI

		// The total number of turns is determined by the number of stepdowns
		// and the diameter of the hole.

		// Sine: Given an angle θ, sin(θ) is equal to the y-value of the point
		// on the unit circle determined by the angle θ. So, sin(0º)=0,
		// sin(90º)=1, sin(45º)=√2/2 and so on. This is represented by the red
		// line in the animation I provided.  https://i.imgur.com/WdV8bhB.gif

		// Cosine: Given an angle θ, cos(θ) is equal to the x-value of the point
		// on the unit circle determined by the angle θ. So, cos(0º)=1,
		// cos(90º)=0, cos(45º)=√2/2 and so on. This is represented by the blue
		// line in the animation I provided.  https://i.imgur.com/0hpGkOR.gif

		const holeDiameter = 20;
		const holeRadius = holeDiameter / 2;
		const radTurns = ONETURN * 30;
		const toolDiameter = 12;
		const toolRadius = toolDiameter / 2;
		const stepoverPercent = 0.9;
		const stepdown = 3;
		const thetaStep = 0.07;
		const stepover = toolDiameter * stepoverPercent;

		// TODO: Remove, draw a bounding box in the size of the diameter
		block.moveRapid({ x: -holeRadius, y: -holeRadius }); // down left
		block.move({ x: holeRadius, y: -holeRadius }); // right
		block.move({ x: holeRadius, y: holeRadius }); // up
		block.move({ x: -holeRadius, y: holeRadius }); // left
		block.move({ x: -holeRadius, y: -holeRadius }); // down

		let pos = new Point(0, 0);
		const center = new Point(0, 0);

		for (let theta = 0; /* theta < radTurns */; theta += thetaStep) {
			const revolutions = theta / ONETURN;
			const distanceFromCenter = center.distanceTo(pos);

			if (distanceFromCenter > holeRadius - toolRadius) {
				const prevTheta = theta - thetaStep;
				const nearestPointOnCircumference = new Point(
					0 + (holeRadius - toolRadius) * Math.cos(prevTheta),
					0 + (holeRadius - toolRadius) * Math.sin(prevTheta),
				);

				block
					.move({ ...nearestPointOnCircumference })
					.arc({
						dir: Dir.CW,
						end: nearestPointOnCircumference,
						around: new Point(
							-nearestPointOnCircumference.x,
							-nearestPointOnCircumference.y,
						),
					})
					.move({ ...center });
				break;
			}

			const spiralEffect = revolutions * stepover;

			pos = new Point(
				spiralEffect * Math.cos(theta),
				spiralEffect * Math.sin(theta),
			);

			console.log('-------------', {
				theta,
				revolutions,
				pos,
				distanceFromCenter,
				spiralEffect,
			});

			block.move({ ...pos });
		}

		console.log('-------------------------');
		console.log({
			holeDiameter,
			radTurns,
			toolDiameter,
			stepoverPercent,
			stepdown,
			stepover,
		});

		block.comment('Spiral end');

		return block;
	}
}
