export interface MachineParams {
	feedrate: number;
	rapidFeedrate: number;
	safeHeight: number;
	spindleSpeed: number;
	toolDiameter: number;
}

export interface FrontParams {
	width: number;
	height: number;
	engraveDepth: number;
	doChamferEdges: boolean;
	doCutout: boolean;
}
