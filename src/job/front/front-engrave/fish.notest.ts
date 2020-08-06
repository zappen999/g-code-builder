import { FishFrontEngrave, FishFrontParams } from './fish';
import { FitDimension } from 'job/index';
import * as fs from 'fs';

describe('FishFrontJob', () => {
	it('should work', () => {
		const fishFrontParams: FishFrontParams = {
			width: 597,
			height: 381,
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
			// Fish front specific
			fitDimension: FitDimension.HORIZONTAL,
			// fitDimension: FitDimension.VERTICAL,
			patternRepeatCount: 6,
		};

		const job = new FishFrontEngrave(fishFrontParams);
		const program = job.build();
		fs.writeFileSync('output/fish.nc', program.toString());
	});
});
