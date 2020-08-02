import type { XYZ } from './types';
import type { Point } from './point';
import { Plane, Unit, Dir, CoordinateSystem } from './enums';
import { isSet } from './helpers';

export interface Command<ArgT> {
	scale(factor: XYZ): void;
	moveRelative(to: XYZ): void;
	setArg(arg: ArgT): void;
	clone(): Command<ArgT>;
	toString(precision: number): string;
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

		// TODO: Suboptimal performance
		clone.setArg(JSON.parse(JSON.stringify(this.getArg())));
		return clone;
	}

	// eslint-disable-next-line
	scale(factor: XYZ): void { }

	// eslint-disable-next-line
	moveRelative(to: XYZ): void { }

	abstract toString(precision: number): string;
}

export type PlaneArg = Plane;
export class PlaneCommand
	extends BaseCommand<PlaneArg>
	implements Command<PlaneArg>
{
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

export class AbsolutePositioningCommand
	extends BaseCommand<void>
	implements Command<void>
{
	constructor() {
		super();
	}

	toString(): string {
		return 'G90';
	}
}

export type UnitArg = Unit;
export class UnitCommand
	extends BaseCommand<UnitArg>
	implements Command<UnitArg>
{
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
export class CoordinateSystemCommand
	extends BaseCommand<CoordinateSystemArg>
	implements Command <CoordinateSystemArg>
{
	toString(): string {
		return this.arg;
	}
}

export type ChangeToolArg = { toolName: string; toolNumber?: number };

export class ChangeToolCommand
	extends BaseCommand<ChangeToolArg>
	implements Command <ChangeToolArg>
{
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

export class CommentCommand
	extends BaseCommand<CommentArg>
	implements Command <CommentArg>
{
	toString(): string {
		return `(${this.arg})`;
	}
}

export type StartSpindleArg = { dir: Dir; rpm: number; };
export class StartSpindleCommand
	extends BaseCommand<StartSpindleArg>
	implements Command <StartSpindleArg>
{
	toString(): string {
		return `${this.arg.dir === Dir.CW ? 'M3' : 'M4'} S${this.arg.rpm}`;
	}
}

export type RapidFeedRateArg = number;
export class RapidFeedRateCommand
	extends BaseCommand<RapidFeedRateArg>
	implements Command <RapidFeedRateArg>
{
	toString(): string {
		return `G0 F${this.arg}`;
	}
}

export type LinearFeedRateArg = number;
export class LinearFeedRateCommand
	extends BaseCommand<LinearFeedRateArg>
	implements Command <LinearFeedRateArg>
{
	toString(): string {
		return `G1 F${this.arg}`;
	}
}

export type MoveArg = XYZ & { feedrate?: number };
export class MoveCommand
	extends BaseCommand<MoveArg>
	implements Command<MoveArg>
{
	scale(factor: XYZ): void {
		if (factor.x && this.arg.x) this.arg.x *= factor.x;
		if (factor.y && this.arg.y) this.arg.y *= factor.y;
		if (factor.z && this.arg.z) this.arg.z *= factor.z;
	}

	moveRelative(to: XYZ): void {
		if (to.x && this.arg.x) this.arg.x += to.x;
		if (to.y && this.arg.y) this.arg.y += to.y;
		if (to.z && this.arg.z) this.arg.z += to.z;
	}

	protected getGCode(): string {
		return 'G1';
	}

	toString(precision = 4): string {
		let result = this.getGCode();
		const { x, y, z, feedrate } = this.arg;

		if (!isSet(x) && !isSet(y) && !isSet(z)) {
			throw new Error('At least one argument is required');
		}

		if (isSet(x)) result += ` X${x.toFixed(precision)}`;
		if (isSet(y)) result += ` Y${y.toFixed(precision)}`;
		if (isSet(z)) result += ` Z${z.toFixed(precision)}`;
		if (feedrate) result += ` F${feedrate.toFixed(precision)}`;

		return result;
	}
}

export class MoveRapidCommand
	extends MoveCommand
	implements Command<MoveArg>
{
	protected getGCode(): string { return 'G0'; }
}

export type ArcArg = {
	dir: Dir;
	end: Point;
	around: Point;
	feedrate?: number;
};

export class ArcCommand
	extends BaseCommand<ArcArg>
	implements Command<ArcArg>
{
	scale(factor: XYZ): void {
		if (factor.x) {
			this.arg.end.x *= factor.x;
			this.arg.around.x *= factor.x;
		}
		if (factor.y) {
			this.arg.end.y *= factor.y;
			this.arg.around.y *= factor.y;
		}
	}

	moveRelative(to: XYZ): void {
		if (to.x) this.arg.end.x += to.x;
		if (to.y) this.arg.end.y += to.y;
	}

	toString(precision = 4): string {
		const { dir, end, around, feedrate } = this.arg;
		const code = dir === Dir.CW ? 'G2' : 'G3';
		let result = code;

		result += ` X${end.x.toFixed(precision)}`;
		result += ` Y${end.y.toFixed(precision)}`;
		result += ` I${around.x.toFixed(precision)}`;
		result += ` J${around.y.toFixed(precision)}`;

		if (feedrate) result += ` F${feedrate.toFixed(precision)}`;

		return result;
	}
}

export type StopSpindleArg = void;
export class StopSpindleCommand
	extends BaseCommand<StopSpindleArg>
	implements Command<StopSpindleArg>
{
	toString(): string {
		return 'M5';
	}
}

export type EndArg = void;
export class EndCommand
	extends BaseCommand<EndArg>
	implements Command<EndArg>
{
	toString(): string {
		return 'M2';
	}
}
