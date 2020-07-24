import type { XYZ } from './types';
import { Plane, Unit, Dir, CoordinateSystem } from './enums';

export interface Command<ArgT> {
	scale(factor: XYZ): void;
	move(to: XYZ): void;
	setArg(arg: ArgT): void;
	clone(): Command<ArgT>;
	toString(): string;
}

export abstract class BaseCommand<ArgT> {
	constructor(protected arg: ArgT) { }

	setArg(arg: ArgT): void {
		this.arg = arg;
	}

	getArg(): ArgT {
		return this.arg;
	}

	clone(): Command<ArgT> {
		const clone = new (
			this.constructor as { new (): Command<ArgT> }
		)();

		clone.setArg(this.getArg());
		return clone;
	}

	abstract scale(factor: XYZ): void;
	abstract move(to: XYZ): void;
	abstract toString(): string;
}

export type PlaneArg = Plane;

export class PlaneCommand extends BaseCommand<PlaneArg> implements Command<PlaneArg> {
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

export class AbsolutePositioningCommand extends BaseCommand<void> implements Command<void> {
	constructor() {
		super();
	}

	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return 'G90'; }
}


export type UnitArg = Unit;

export class UnitCommand extends BaseCommand<UnitArg> implements Command<UnitArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string {
		switch (this.arg) {
			case Unit.INCHES:
				return 'G20';
			case Unit.MILLIMETERS:
				return 'G21';
		}
	}
}

export type CoordinateSystemArg = CoordinateSystem;

export class CoordinateSystemCommand extends BaseCommand<CoordinateSystemArg> implements Command <CoordinateSystemArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return this.arg; }
}

export type ChangeToolArg = { toolName: string; toolNumber?: number };

export class ChangeToolCommand extends BaseCommand<ChangeToolArg> implements Command <ChangeToolArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string {
		const { toolName, toolNumber } = this.arg;
		let result = `(Tool change: ${toolName})\nM6`;

		if (toolNumber) {
			result += ` T${toolNumber}`;
		}

		return result;
	}
}

export type CommentArg = string;

export class CommentCommand extends BaseCommand<CommentArg> implements Command <CommentArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return `(${this.arg})`; }
}

export type StartSpindleArg = { dir: Dir; rpm: number; };

export class StartSpindleCommand extends BaseCommand<StartSpindleArg> implements Command <StartSpindleArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string {
		return `${this.arg.dir === Dir.CW ? 'M3' : 'M4'} S${this.arg.rpm}`;
	}
}

export type RapidFeedRateArg = number;

export class RapidFeedRateCommand extends BaseCommand<RapidFeedRateArg> implements Command <RapidFeedRateArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return `G0 F${this.arg}`; }
}

export type LinearFeedRateArg = number;

export class LinearFeedRateCommand extends BaseCommand<LinearFeedRateArg> implements Command <LinearFeedRateArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return `G1 F${this.arg}`; }
}

export type MoveArg = XYZ & { feedrate?: number };

export class MoveCommand extends BaseCommand<MoveArg> implements Command<MoveArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	protected getGCode(): string { return 'G1'; }
	toString(): string {
		let result = this.getGCode();
		const { x, y, z, feedrate } = this.arg;

		if (!x && !y && !z) {
			throw new Error('At least one argument is required');
		}

		if (x) result += ` X{x}`;
		if (y) result += ` Y{y}`;
		if (z) result += ` Z{z}`;
		if (feedrate) result += ` F{feedrate}`;

		return result;
	}
}

export class MoveRapidCommand extends MoveCommand implements Command<MoveArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	protected getGCode(): string { return 'G0'; }
}

export type ArcArg = {
	dir: Dir;
	x: number;
	y: number;
	xi: number;
	yj: number;
	feedrate?: number;
};

export class ArcCommand extends BaseCommand<ArcArg> implements Command<ArcArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string {
		const { dir, x, y, xi, yj, feedrate } = this.arg;
		const code = dir === Dir.CW ? 'G2' : 'G3';
		let result = `${code} X${x} Y${y} I${xi} J${yj}`;

		if (feedrate) result += ` F${feedrate}`;

		return result;
	}
}

export type StopSpindleArg = void;

export class StopSpindleCommand extends BaseCommand<StopSpindleArg> implements Command<StopSpindleArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return 'M5'; }
}

export type EndArg = void;

export class EndCommand extends BaseCommand<EndArg> implements Command<EndArg> {
	scale(factor: XYZ): void { }
	move(to: XYZ): void { }
	toString(): string { return 'M2'; }
}
