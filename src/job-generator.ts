/**
 * Uses IKEA definitions and applies jobs to them.
 */

import { FRONTS } from 'ikea/index';

import {
	BaseJob,
	MachineParams,
	FrontParams,
	SquareFrontCutout,
	SquareFrontCutoutParams,
	// RombFrontEngrave,
	// RombFrontEngraveParams,
	// FishFrontEngrave,
	// FishFrontEngraveParams,
	// FitDimension,
	// BaseFrontHingeParams,
} from 'job/index';
// import { Point, AxisDir } from 'lib/index';
// import type { FrontEngraveParams } from 'job/front/front-engrave/base';
import * as fs from 'fs';

const DEFAULT_MACHINE_PARAMS: MachineParams = {
	feedrate: 600,
	rapidFeedrate: 10000,
	safeHeight: 5,
	probe: {
		feedrate: 60,
		maxTravel: 30,
	},
};


function writeToFile (job: BaseJob, name: string): void {
	fs.writeFileSync(
		`output/${name}.nc`,
		job.buildProgram().toString()
	);
	fs.writeFileSync(
		`output/${name}-docs.html`,
		job.buildDocs()
	);
}

for (const id of Object.keys(FRONTS)) {
	const width = FRONTS[id].width;
	const height = FRONTS[id].height;

	const frontParams: FrontParams = {
		width,
		height,
		thickness: 16,
	};

// 	const baseFrontEngraveParams: FrontEngraveParams = {
// 		...frontParams,
// 		engrave: {
// 			ctrl: {
// 				tool: {
// 					id: 1,
// 					name: '90 V-bit',
// 					diameter: 10,
// 				},
// 				feedrate: 1000,
// 				spindleSpeed: 24000,
// 				stepdown: 10,
// 			},
// 			depth: 2,
// 		},
// 		chamfer: {
// 			ctrl: {
// 				tool: {
// 					id: 1,
// 					name: '90 V-bit',
// 					diameter: 10,
// 				},
// 				feedrate: 1000,
// 				spindleSpeed: 24000,
// 				stepdown: 10,
// 			},
// 			cornerRadius: 0,
// 		},
// 	}

	// Romb
	// const horizontalPatternCount = 6;
	// const verticalPatternCount = 3;
	// const patternWidth = width/horizontalPatternCount;
	// const rombFrontEngraveParams: RombFrontEngraveParams = {
	// 	...baseFrontEngraveParams,
	// 	patternWidth,
	// 	patternHeightMultiplier: height/patternWidth / verticalPatternCount,
	// };

// 	// Fish
// 	const fishFrontEngraveParams: FishFrontEngraveParams = {
// 		...baseFrontEngraveParams,
// 		fitDimension: FitDimension.HORIZONTAL,
// 		patternRepeatCount: 6,
// 	};

	const squareFrontCutoutParams: SquareFrontCutoutParams = {
		...frontParams,
		cutout: {
			ctrl: {
				tool: {
					id: 2,
					name: 'Endmill 6mm',
					diameter: 6,
				},
				feedrate: 600,
				spindleSpeed: 12000,
				stepdown: 10,
			},
			bedProbe: {
				pos: { x: -50, y: -50, z: 50 },
				touchPlaceThickness: 20,
			},
		},
	}

	// Hinge
	// const baseHingeFrontParams: BaseFrontHingeParams = {
	// 	...frontParams,
	// 	hinge: {
	// 		ctrl: {
	// 			tool: {
	// 				id: 1,
	// 				name: '6 mm end mill',
	// 				diameter: 4,
	// 			},
	// 			feedrate: 600,
	// 			spindleSpeed: 12000,
	// 			stepdown: 4,
	// 			stepover: 3.8,
	// 		},
	// 		hinges: [
	// 			{ pos: new Point(400, 100), dir: AxisDir.X_NEG },
	// 			{ pos: new Point(400, 300), dir: AxisDir.X_NEG },
	// 		],
	// 	},
	// };

	console.log({id});

	const squareCutoutJob = new SquareFrontCutout(
		DEFAULT_MACHINE_PARAMS,
		squareFrontCutoutParams,
	);
	writeToFile(squareCutoutJob, `${id}-square-cutout`);
}
