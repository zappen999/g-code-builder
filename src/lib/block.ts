import type { Plane, Dir, CoordinateSystem, Unit } from './enums';
import type { XYZ, Point } from './types';
import {
	Command,
	PlaneCommand,
	AbsolutePositioningCommand,
	UnitCommand,
	CoordinateSystemCommand,
	ChangeToolCommand,
	CommentCommand,
	StartSpindleCommand,
	StopSpindleCommand,
	ArcCommand,
	MoveCommand,
	MoveRapidCommand,
	LinearFeedRateCommand,
	RapidFeedRateCommand,
	EndCommand,
} from './command';

export class Block {
	protected commands: Command<unknown>[];

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

	setCoordinateSystem(coordinateSystem: CoordinateSystem): Block {
		const cmd = new CoordinateSystemCommand(coordinateSystem);
		this.commands.push(cmd);
		return this;
	}

	changeTool(toolName: string, toolNumber?: number): Block {
		const cmd = new ChangeToolCommand({ toolName, toolNumber });
		this.commands.push(cmd);
		return this;
	}

	comment(text: string): Block {
		const cmd = new CommentCommand(text);
		this.commands.push(cmd);
		return this;
	}

	startSpindle(dir: Dir, rpm: number): Block {
		const cmd = new StartSpindleCommand({ dir, rpm });
		this.commands.push(cmd);
		return this;
	}

	setLinearFeedrate(feedrate: number): Block {
		const cmd = new LinearFeedRateCommand(feedrate);
		this.commands.push(cmd);
		return this;
	}

	setRapidFeedrate(feedrate: number): Block {
		const cmd = new RapidFeedRateCommand(feedrate);
		this.commands.push(cmd);
		return this;
	}

	moveRapid(to: XYZ, feedrate?: number): Block {
		const cmd = new MoveRapidCommand({ ...to, feedrate });
		this.commands.push(cmd);
		return this;
	}

	move(to: XYZ, feedrate?: number): Block {
		const cmd = new MoveCommand({ ...to, feedrate });
		this.commands.push(cmd);
		return this;
	}

	arc(arg: {
		dir: Dir,
		end: Point,
		around: Point, // offset to center relative to start (current) position.
		feedrate?: number
	}): Block {
		const cmd = new ArcCommand(arg);
		this.commands.push(cmd);
		return this;
	}

	// TODO: Implement this when getting tired of using 'arc' function.
	arcByRadius(arg: {
		dir: number | 'tangent',
		rotation: Dir,
		radius: number,
		angle: number,
	}): Block {
		// Distance between start point and center point should be equal to the
		// distance between end point and center point.
		//
		// Center point should be between start and end.
		// We know starting point.
		// We don't know the ending point.
		//
		// Calc the ending point by start point + radius + angle
		return this;
	}

	stopSpindle(): Block {
		const cmd = new StopSpindleCommand();
		this.commands.push(cmd);
		return this;
	}

	end (): Block {
		const cmd = new EndCommand();
		this.commands.push(cmd);
		return this;
	}

	///////////////
	//  Editing  //
	///////////////

	editScale(factor: XYZ): void {
		for (const cmd of this.commands) {
			cmd.scale(factor);
		}
	}

	// NOTE: Only usable when using absolute positioning
	editMoveRelative(to: XYZ): void {
		for (const cmd of this.commands) {
			cmd.moveRelative(to);
		}
	}

	clone(): Block {
		const clone = new Block();
		
		for (const cmd of this.commands) {
			clone.addCommand(cmd.clone());
		}

		return clone;
	}

	addBlock (block: Block): void {
		for (const cmd of block.commands) {
			this.commands.push(cmd);
		}
	}

	addCommand (command: Command<unknown>): void {
		this.commands.push(command);
	}

	toString(precision = 4): string {
		return this.commands
			.map(command => command.toString(precision))
			.join('\n');
	}
}
