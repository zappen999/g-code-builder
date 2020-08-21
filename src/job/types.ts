export interface MachineParams {
	feedrate: number;
	rapidFeedrate: number;
	safeHeight: number;
	probe: {
		feedrate: number;
		maxTravel: number;
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
	stepover?: number;
}
