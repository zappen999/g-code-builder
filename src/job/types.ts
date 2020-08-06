import type { XYZ } from 'lib/index';

export interface MachineParams {
	rapidFeedrate: number;
	safeHeight: number;
	probe: {
		feedrate: number;
		maxTravel: number;
		// Where should we start to probe for different use-cases
		positions: {
			// Zero Z against the working bed (to avoid cutting into wasteboard)
			workBedSurface: {
				pos: XYZ;
				touchPlaceThickness: number;
			}
		};
	}
}

export interface Tool {
	id: number;
	name: string;
	diameter: number;
}

export interface ToolController {
	tool: Tool;
	feedrate: number;
	spindleSpeed: number;
	stepdown: number;
}
