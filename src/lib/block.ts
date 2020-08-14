import type { Plane, Dir, CoordinateSystem, Unit } from './enums';
import type { XYZ } from './types';
import type { Point } from './point';
import {
	Command,
	PlaneCommand,
	AbsolutePositioningCommand,
	RelativePositioningCommand,
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
	StopCommand,
	EndCommand,
	ProbeCommand,
	RawCommand,
	ProbeArg,
} from './command';

export class Block {
	protected commands: Command<unknown>[];

	constructor() {
		this.commands = [];
	}

	setPlane(plane: Plane): Block {
		return this.addCommand(new PlaneCommand(plane));
	}

	setAbsolutePositioning(): Block {
		return this.addCommand(new AbsolutePositioningCommand());
	}

	setRelativePositioning(): Block {
		return this.addCommand(new RelativePositioningCommand());
	}

	setUnits(unit: Unit): Block {
		return this.addCommand(new UnitCommand(unit));
	}

	setCoordinateSystem(coordinateSystem: CoordinateSystem): Block {
		return this.addCommand(new CoordinateSystemCommand(coordinateSystem));
	}

	changeTool(toolName: string, toolNumber?: number): Block {
		return this.addCommand(new ChangeToolCommand({ toolName, toolNumber }));
	}

	comment(text: string): Block {
		return this.addCommand(new CommentCommand(text));
	}

	startSpindle(dir: Dir, rpm: number): Block {
		return this.addCommand(new StartSpindleCommand({ dir, rpm }));
	}

	setLinearFeedrate(feedrate: number): Block {
		return this.addCommand(new LinearFeedRateCommand(feedrate));
	}

	setRapidFeedrate(feedrate: number): Block {
		return this.addCommand(new RapidFeedRateCommand(feedrate));
	}

	moveRapid(to: XYZ, feedrate?: number): Block {
		return this.addCommand(new MoveRapidCommand({ ...to, feedrate }));
	}

	move(to: XYZ, feedrate?: number): Block {
		return this.addCommand(new MoveCommand({ ...to, feedrate }));
	}

	arc(arg: {
		dir: Dir,
		end: Point,
		around: Point, // offset to center relative to start (current) position.
		feedrate?: number
	}): Block {
		return this.addCommand(new ArcCommand(arg));
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
		return this.addCommand(new StopSpindleCommand());
	}

	stop (): Block {
		return this.addCommand(new StopCommand());
	}

	probe (arg: ProbeArg): Block {
		return this.addCommand(new ProbeCommand(arg));
	}

	raw (arg: string): Block {
		return this.addCommand(new RawCommand(arg));
	}


	end (): Block {
		return this.addCommand(new EndCommand());
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

	addCommand (command: Command<unknown>): Block {
		this.commands.push(command);
		return this;
	}

	getEstimatedRuntimeSec (): number {
		// TODO: Real
		return 10;
	}

	toString(precision = 4): string {
		return this.commands
			.map(command => command.toString(precision))
			.join('\n');
	}
}
