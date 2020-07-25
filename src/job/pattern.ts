import {
	Block,
	Program,
	Plane,
	Unit,
	CoordinateSystem,
	Dir,
} from '../lib';

export class FrontScript {
	protected program: Program;

	constructor () {
		this.program = new Program();

		const setup = new Block();
		setup
			.setPlane(Plane.XY)
			.setAbsolutePositioning()
			.setUnits(Unit.MILLIMETERS)
			.setCoordinateSystem(CoordinateSystem.G54)
			.startSpindle(Dir.CW, 24000)
			.setLinearFeedrate(600)
			.setRapidFeedrate(10000)
			.move({ x: 0, y: 0 });

		this.program.addBlock(setup);

		const pattern = new Block();

		//////////////////
		//  Parameters  //
		//////////////////

		const FRONT = {
			WIDTH: 597,
			HEIGHT: 381,
		};
		const PATTERN = {
			ROWS: 2,
			COLS: 3,
		};
		const OPTS = {
			// fill, cover, stretch etc
		};

		// Calc the pattern for this front

		const pWidth = FRONT.WIDTH / PATTERN.COLS;
		const pHeight = FRONT.HEIGHT / PATTERN.ROWS;

		console.log({
			FRONT,
			PATTERN,
			OPTS,
			pWidth,
			pHeight,
		});

		pattern.arc({
			dir: Dir.CW,
			end: {
				x: -pWidth,
				y: 0,
			},
			around: { // offset to center relative to start (current) position.
				x: -(pWidth/2), // divided by 2 since it's the radius
				y: 0,
			},
		});

		for (let row = 0; row < PATTERN.ROWS; row++) {
			const isOddRow = Boolean(row % 2);

			for (let col = 0; col < PATTERN.COLS; col++) {
				const isFirstColumn = col === 0;
				const isLastColumn = col === PATTERN.COLS - 1;

				const part = new Block();
				const replica = pattern.clone();

				if (isFirstColumn) {
					part.move({ z: 0 });

					if (isOddRow) {
						// Make half arc, continue...
					}
				}

				replica.editMoveRelative({
					x: -(pWidth * col) + (isOddRow ? pWidth/2 : 0),
					y: -(pWidth/2 * row),
				});

				if (isLastColumn) {
					replica.move({ z: 10 });
					replica.moveRapid({
						x: (isOddRow ? 0 : -pWidth/2),
						y: -(pWidth/2 * (row + 1)),
					});
				}

				part.addBlock(replica);
				this.program.addBlock(part);
			}
		}
	}

	toString(): string {
		return this.program.toString();
	}
}
