/**
 * Generic types
 */
interface XYZ {
	x?: number;
	y?: number;
	z?: number;
}

enum Plane {
	XY = 'XY',
}

enum Unit {
	INCHES = 'INCHES',
	MILLIMETERS = 'MILLIMETERS',
}

class Program {
	constructor() {
		this.blocks = [];
	}

	addBlock(block: Block): void {
		this.blocks.push(block);
	}

	toString(): string {
		return this.blocks
			.map(block => block.toString())
			.join('\n');
	}
}

class Block {
	constructor() {
		this.commands = [];
	}

	setPlane(plane: Plane): Block {
		const cmd = new PlaneCommand(plane);
		this.commands.push(cmd);
		return this;
	}

	setAbsolutePositioning(): Block {
		const cmd = new AbsolutePositioningCommand();
		this.commands.push(cmd);
		return this;
	}

	setUnits(unit: Unit): Block {
		const cmd = new UnitCommand(unit);
		this.commands.push(cmd);
		return this;
	}

	toString(): string {
		return this.commands
			.map(command => command.toString())
			.join('\n');
	}
}

interface Command<ArgT> {
	scale(factor: XYZ): void;
	move(to: XYZ): void;
	setArg(arg: ArgT): void;
	toString(): string;
}

abstract class BaseCommand<ArgT> implements Command<ArgT> {
	constructor(protected arg: ArgT) { }

	setArg(arg: ArgT): void {
		this.arg = arg;
	}

	abstract scale(factor: XYZ): void;
	abstract move(to: XYZ): void;
	abstract toString(): string;
}

enum SetPlaneArg = Plane;

class SetPlaneCommand extends BaseCommand implements Command<SetPlaneArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string {
		switch (this.arg) {
			case Plane.XY:
				return 'G17';
			case Plane.ZX:
				return 'G18';
			case Plane.YZ:
				return 'G19';
		}
	}
}

class AbsolutePositioningCommand extends BaseCommand implements Command<void> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return 'G90'; }
}
