import { RombFrontEngrave } from './romb';
import * as fs from 'fs';

describe('RombFrontJob', () => {
	it.only('should work', () => {
		const horizontalPatternCount = 6;
		const verticalPatternCount = 2;
		const width = 597;
		const height = 381;
		const patternWidth = width/horizontalPatternCount;

		const rombFrontParams = {
			width,
			height,
			chamferEdges: false, // TODO: We want this
			// Romb front specific:
			patternWidth,
			patternHeightMultiplier: height/patternWidth / verticalPatternCount,
		};

		const job = new RombFrontEngrave(rombFrontParams);
		const program = job.build();
		fs.writeFileSync('output/romb.nc', program.toString());
	});
});
