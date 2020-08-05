import { RombFrontEngrave, RombFrontParams } from './romb';
import * as fs from 'fs';

describe('RombFrontJob', () => {
	it('should work', () => {
		const horizontalPatternCount = 6;
		const verticalPatternCount = 2;
		const width = 597;
		const height = 381;
		const patternWidth = width/horizontalPatternCount;

		const rombFrontParams: RombFrontParams = {
			width,
			height,
			engraveDepth: 2,
			doChamferEdges: true,
			doCutout: true,
			// Romb front specific:
			patternWidth,
			patternHeightMultiplier: height/patternWidth / verticalPatternCount,
		};

		const job = new RombFrontEngrave(rombFrontParams);
		const program = job.build();
		fs.writeFileSync('output/romb.nc', program.toString());
	});
});
