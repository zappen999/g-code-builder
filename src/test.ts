const setup = new Block();

setup
	.setPlane(Plane.XY)
	.setAbsolutePositioning()
	// .setRelativePositioning()
	.setUnits(Units.MILLIMETERS)
	// .setUnits(Units.INCHES)
	.setCoordinateSystem(CoordinateSystem.G54)
	.changeTool('Engraver')
	.comment('This is nice stuff')
	.startSpindle(Dir.CW, 10000);

const pattern = new Block();

// Remember all instructions to be able to go through them and apply scaling,
// positioning etc later on.
pattern
	.setFeedRate(600) // remembers this in state for future
	.moveRapid({ x: 0, y: 0, z: 0}) // G0 xyz.. F600
	.move({ x: 0, y: 0, z: 0}) // G1 xyz.. F600
	.arc(Dir.CW, { x: 0, y: 0, xi: 3, yj: 0 }) // G2 X Y I J ... F600
	.move({ z: 5 }) // move up

// Be able to edit a command, how do we go back and change the feedrate, an arc?
// We must have IDs of some kind.

const finish = new Block();

finish
	.stopSpindle() // M5
	.end() // M2


const program = new Program();
program.addBlock(setup);
program.addBlock(pattern);
program.addBlock(finish);


console.log(program.toString());

/**
 * Program
 * Block/Sequence
 * Command
 *	- scale
 *	- move
 *	- edit parameters
 */
