import { expect } from 'chai';
import { Block } from './block';
import { Plane, Unit, CoordinateSystem, Dir } from './enums';

describe('Block', () => {
	let block: Block;

	beforeEach(() => {
		block = new Block();
	});

	describe('Set plane', () => {
		it('should set XY plane (G17)', () => {
			block!.setPlane(Plane.XY)
			expect(block!.toString()).to.equal('G17');
		});

		it('should set ZX plane (G18)', () => {
			block!.setPlane(Plane.ZX)
			expect(block!.toString()).to.equal('G18');
		});

		it('should set YZ plane (G19)', () => {
			block!.setPlane(Plane.YZ)
			expect(block!.toString()).to.equal('G19');
		});
	});

	it('should set absolute positioning (G90)', () => {
		block!.setAbsolutePositioning()
		expect(block!.toString()).to.equal('G90');
	});

	describe('Set units', () => {
		it('should set millimeters (G21)', () => {
			block!.setUnits(Unit.MILLIMETERS)
			expect(block!.toString()).to.equal('G21');
		});

		it('should set inches (G20)', () => {
			block!.setUnits(Unit.INCHES)
			expect(block!.toString()).to.equal('G20');
		});
	});

	it('should combine all commands', () => {
		block!.setUnits(Unit.INCHES);
		block!.setPlane(Plane.XY);
		expect(block!.toString()).to.equal('G20\nG17');
	});

	it('should set coordinate system', () => {
		block!.setCoordinateSystem(CoordinateSystem.G54);
		expect(block!.toString()).to.equal('G54');
	});

	it('should support tool change', () => {
		block!.changeTool('Drill');
		expect(block!.toString()).to.equal('M6 (Drill)');
	});

	it('should support comments', () => {
		block!.comment('Note that ...');
		expect(block!.toString()).to.equal('(Note that ...)');
	});

	describe('Start spindle', () => {
		it('should start spindle clockwise', () => {
			block!.startSpindle(Dir.CW, 10000);
			expect(block!.toString()).to.equal('M3 S10000');
		});

		it('should start spindle counter clockwise', () => {
			block!.startSpindle(Dir.CCW, 10000);
			expect(block!.toString()).to.equal('M4 S10000');
		});
	});

	// describe('Arc by radius', () => {
	// 	it('should calculate the end and center points', () => {
	// 		block!.arcByRadius({
	// 			// TODO: We need to know in which direction it should go (angle?).
	// 			dir: 90,
	// 			rotation: Dir.CW,
	// 			radius: 40,
	// 			angle: 90,
	// 		});
	// 		expect(block!.toString()).to.equal('G3 X59.7000 Y0.0000 I29.8500 J0.0000');
	// 	});
	// });
});

