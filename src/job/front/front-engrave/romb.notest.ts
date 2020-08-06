import { RombFrontEngrave, RombFrontEngraveParams } from './romb';
import * as fs from 'fs';

describe('RombFrontJob', () => {
	it('should work', () => {
		const horizontalPatternCount = 1;
		const verticalPatternCount = 1;
		const width = 100;
		const height = 100;
		const patternWidth = width/horizontalPatternCount;

		const rombFrontParams: RombFrontEngraveParams = {
			width,
			height,
			thickness: 16,
			engrave: {
				ctrl: {
					tool: {
						id: 1,
						name: '90 V-bit',
						diameter: 10,
					},
					feedrate: 1000,
					spindleSpeed: 24000,
					stepdown: 10,
				},
				depth: 2,
			},
			chamfer: {
				ctrl: {
					tool: {
						id: 1,
						name: '90 V-bit',
						diameter: 10,
					},
					feedrate: 1000,
					spindleSpeed: 24000,
					stepdown: 10,
				},
				cornerRadius: 0,
			},
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
				cornerRadius: 0,
				probeBed: true,
			},
			// Romb front specific:
			patternWidth,
			patternHeightMultiplier: height/patternWidth / verticalPatternCount,
		};

		const job = new RombFrontEngrave(rombFrontParams);
		const program = job.build();
		fs.writeFileSync('output/romb.nc', program.toString());
	});
});
