import { Program } from './program';
import { Block } from './block';
import { Plane, Unit, CoordinateSystem, Dir } from './enums';

describe('Program', () => {
	it('should compose a program', () => {
		const program = new Program();
		const setup = new Block();

		setup
			.setPlane(Plane.XY)
			.setAbsolutePositioning()
			.setUnits(Unit.MILLIMETERS)
			.setCoordinateSystem(CoordinateSystem.G54)
			.changeTool('Engraver', 2)
			.comment('This is nice stuff')
			.startSpindle(Dir.CW, 10000);

		program.addBlock(setup);
	});
});
