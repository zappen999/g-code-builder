import type { Plane, Dir, CoordinateSystem, Unit } from './enums';
import type { XYZ } from './types';
import {
	Command,
	PlaneCommand,
	AbsolutePositioningCommand,
	UnitCommand,
	CoordinateSystemCommand,
	ChangeToolCommand,
	CommentCommand,
	StartSpindleCommand,
} from './command';

export class Block {
	protected commands: Command<any>[];

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

	///////////////
	//  Editing  //
	///////////////

	editScale(factor: XYZ): void {
		for (const cmd of this.commands) {
			cmd.scale(factor);
		}
	}

	// NOTE: Only usable when using absolute positioning
	editMove(to: XYZ): void {
		for (const cmd of this.commands) {
			cmd.move(to);
		}
	}

	clone(): Block {
		const clone = new Block();
		
		for (const cmd of this.commands) {
			clone.addCommand(cmd.clone());
		}

		return clone;
	}

	addCommand (command: Command<any>): void {
		this.commands.push(command);
	}

	toString(): string {
		return this.commands
			.map(command => command.toString())
			.join('\n');
	}
}
