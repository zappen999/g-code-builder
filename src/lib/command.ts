import type { XYZ } from './types';
import type { Point } from './point';
import { Plane, Unit, Dir, CoordinateSystem, AxisDir } from './enums';
import { isSet } from './helpers';

export interface Command<ArgT> {
	scale(factor: XYZ): void;
	translate(to: XYZ): void;
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

		const arg = JSON.stringify(this.getArg())

		if (arg) {
			clone.setArg(JSON.parse(arg));
		}

		return clone;
	}

	// eslint-disable-next-line
	scale(factor: XYZ): void { }

	// eslint-disable-next-line
	translate(to: XYZ): void { }

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

export class RelativePositioningCommand
	extends BaseCommand<void>
	implements Command<void>
{
	constructor() {
		super();
	}

	toString(): string {
		return 'G91';
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

		if (isSet(toolNumber)) {
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

export type MoveArg = XYZ & {
	feedrate?: number;
	overrideCoordinateSystem?: CoordinateSystem
};
export class MoveCommand
	extends BaseCommand<MoveArg>
	implements Command<MoveArg>
{
	scale(factor: XYZ): void {
		if (isSet(factor.x) && isSet(this.arg.x)) this.arg.x *= factor.x;
		if (isSet(factor.y) && isSet(this.arg.y)) this.arg.y *= factor.y;
		if (isSet(factor.z) && isSet(this.arg.z)) this.arg.z *= factor.z;
	}

	translate(to: XYZ): void {
		if (isSet(to.x) && isSet(this.arg.x)) this.arg.x += to.x;
		if (isSet(to.y) && isSet(this.arg.y)) this.arg.y += to.y;
		if (isSet(to.z) && isSet(this.arg.z)) this.arg.z += to.z;
	}

	protected get prefix(): string {
		const { overrideCoordinateSystem } = this.arg;

		if (overrideCoordinateSystem) {
			return `${overrideCoordinateSystem} `;
		} else {
			return '';
		}
	}

	protected getGCode(): string {
		return `${this.prefix}G1`;
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
		if (isSet(feedrate)) result += ` F${feedrate.toFixed(precision)}`;

		return result;
	}
}

export class MoveRapidCommand
	extends MoveCommand
	implements Command<MoveArg>
{
	protected getGCode(): string {
		return `${this.prefix}G1`;
	}
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
		if (isSet(factor.x)) {
			this.arg.end.x *= factor.x;
			this.arg.around.x *= factor.x;
		}
		if (isSet(factor.y)) {
			this.arg.end.y *= factor.y;
			this.arg.around.y *= factor.y;
		}
	}

	translate(to: XYZ): void {
		if (isSet(to.x)) this.arg.end.x += to.x;
		if (isSet(to.y)) this.arg.end.y += to.y;
	}

	toString(precision = 4): string {
		const { dir, end, around, feedrate } = this.arg;
		const code = dir === Dir.CW ? 'G2' : 'G3';
		let result = code;

		result += ` X${end.x.toFixed(precision)}`;
		result += ` Y${end.y.toFixed(precision)}`;
		result += ` I${around.x.toFixed(precision)}`;
		result += ` J${around.y.toFixed(precision)}`;

		if (isSet(feedrate)) result += ` F${feedrate.toFixed(precision)}`;

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

export type ProbeArg = {
	mode: 'towards' | 'away';
	action: 'stop' | 'stop_or_error';
	feedrate: number;
	maxTravel: number;
	axis: AxisDir;
};
export class ProbeCommand
	extends BaseCommand<ProbeArg>
	implements Command<ProbeArg>
{
	toString(): string {
		const { mode, action, axis, feedrate, maxTravel } = this.arg;
		let result = 'G38.';

		if (mode === 'towards') {
			if (action === 'stop_or_error') {
				result += '2';
			} else if (action === 'stop') {
				result += '3';
			}
		} else if (mode === 'away') {
			if (action === 'stop_or_error') {
				result += '4';
			} else if (action === 'stop') {
				result += '5';
			}
		}

		return result + ` ${axis}${maxTravel} F${feedrate}`;
	}
}

export type RawArg = string;
export class RawCommand
	extends BaseCommand<RawArg>
	implements Command<RawArg>
{
	toString(): string {
		return this.arg;
	}

	translate(): void {
		throw new Error('Cannot translate a raw command');
	}

	scale(): void {
		throw new Error('Cannot scale a raw command');
	}
}

export type StopArg = void;
export class StopCommand
	extends BaseCommand<StopArg>
	implements Command<StopArg>
{
	toString(): string {
		return 'M0';
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
