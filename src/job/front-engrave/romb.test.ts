import { expect } from 'chai';
import { RombFrontEngrave } from './romb';
import { FitDimension } from '../enums';
import * as fs from 'fs';

describe('RombFrontJob', () => {
	it.only('should work', () => {
		const rombFrontParams = {
			// width: 600,
			width: 597,
			// height: 300,
			height: 381,
			chamferEdges: false, // TODO: We want this
			// Romb front specific:
			patternWidth: 100, // On horizontal axis
			patternHeightMultiplier: 2, // width * multiplier
		};

		const job = new RombFrontEngrave(rombFrontParams);
		const program = job.build();
		console.log(program.toString());
		fs.writeFileSync('romb.nc', program.toString());
	});
});
