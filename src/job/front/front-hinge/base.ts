import { BaseFront } from 'job/front/index';
import { Block } from 'lib/index';
import type { MachineParams } from 'job/index';
import type { FrontParams } from 'job/front/index';
import { Point, AxisDir } from 'lib/index';
import type { ToolController } from 'job/index';
import { BoreFactory, Bore, DrillFactory, Hole } from 'factory/index';

export interface Hinge {
	// Center point of the bore for the hinge.
	pos: Point;
	// Which way the hinge points when it's attached to the front.
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

const HINGE_SCREWS_DISTANCE_APART = 50;
const HINGE_SCREWS_OFFSET = 10;
const BORE: Bore = { diameter: 35, depth: 8 };
const HOLE: Hole = { depth: 10 };

export class BaseHinge extends BaseFront {
	constructor (
		protected machineParams: MachineParams,
		protected frontParams: BaseFrontHingeParams,
	) {
		super(machineParams, frontParams);

		this.addDocs(
			`This will create a bore of ${BORE.diameter}mm, ` +
			`${BORE.depth}mm depth for the hinges. The hinge screw holes will ` +
			`be ${HINGE_SCREWS_DISTANCE_APART}mm apart, ${HOLE.depth}mm deep, ` +
			`and offset ${HINGE_SCREWS_OFFSET}mm from the bore center in the ` +
			`opposite direction of the hinge`
		);
	}

	build (): Block {
		const { hinges } = this.frontParams.hinge;
		const block = new Block();

		for (const hinge of hinges) {
			block.merge(this.getHingeBlock(hinge));
		}

		return block;
	}

	// TODO: Take real measurements to get positions of skrew holes.
	// https://i.pinimg.com/originals/de/29/fa/de29faef6358c9236b2963ad560f4722.jpg
	getHingeBlock (hinge: Hinge): Block {
		const { ctrl } = this.frontParams.hinge;
		const block = new Block();

		const boreFactory = new BoreFactory(BORE, ctrl);
		const drillFactory = new DrillFactory(HOLE, ctrl);

		block.merge(this.safeTravel({ x: 0, y: 0 }));

		block.merge(boreFactory.build());

		switch (hinge.dir) {
			case AxisDir.X_NEG:
				block.merge(this.safeTravel({
					x: HINGE_SCREWS_OFFSET,
					y: HINGE_SCREWS_DISTANCE_APART/2,
				}));
				break;
			case AxisDir.X_POS:
				block.merge(this.safeTravel({
					x: -HINGE_SCREWS_OFFSET,
					y: HINGE_SCREWS_DISTANCE_APART/2,
				}));
				break;
			case AxisDir.Y_NEG:
				block.merge(this.safeTravel({
					x: -(HINGE_SCREWS_DISTANCE_APART/2),
					y: HINGE_SCREWS_OFFSET,
				}));
				break;
			case AxisDir.Y_POS:
				block.merge(this.safeTravel({
					x: -(HINGE_SCREWS_DISTANCE_APART/2),
					y: -HINGE_SCREWS_OFFSET,
				}));
				break;
		}

		block.merge(drillFactory.build());

		switch (hinge.dir) {
			case AxisDir.X_NEG:
				block.merge(this.safeTravel({
					x: HINGE_SCREWS_OFFSET,
					y: -(HINGE_SCREWS_DISTANCE_APART/2),
				}));
				break;
			case AxisDir.X_POS:
				block.merge(this.safeTravel({
					x: -HINGE_SCREWS_OFFSET,
					y: -(HINGE_SCREWS_DISTANCE_APART/2),
				}));
				break;
			case AxisDir.Y_NEG:
				block.merge(this.safeTravel({
					x: HINGE_SCREWS_DISTANCE_APART/2,
					y: HINGE_SCREWS_OFFSET,
				}));
				break;
			case AxisDir.Y_POS:
				block.merge(this.safeTravel({
					x: HINGE_SCREWS_DISTANCE_APART/2,
					y: -HINGE_SCREWS_OFFSET,
				}));
				break;
		}

		block.merge(drillFactory.build());
		block.translate({ ...hinge.pos });

		return block;
	}
}
