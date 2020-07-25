import { expect } from 'chai';
import { FishFrontEngrave } from './fish';
import { FitDimension } from '../enums';
import * as fs from 'fs';

describe('FishFrontJob', () => {
	it('should work', () => {
		const fishFrontParams = {
			width: 597,
			height: 381,
			chamferEdges: true,
			fitDimension: FitDimension.HORIZONTAL,
			// fitDimension: FitDimension.VERTICAL,
			patternRepeatCount: 6,
		};

		const job = new FishFrontEngrave(fishFrontParams);
		const program = job.build();
		console.log(program.toString());
		fs.writeFileSync('test.nc', program.toString());
	});
});
