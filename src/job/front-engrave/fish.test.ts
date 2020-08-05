import { FishFrontEngrave, FishFrontParams } from './fish';
import { FitDimension } from '../enums';
import * as fs from 'fs';

describe('FishFrontJob', () => {
	it('should work', () => {
		const fishFrontParams: FishFrontParams = {
			width: 597,
			height: 381,
			engraveDepth: 2,
			doChamferEdges: true,
			doCutout: true,
			fitDimension: FitDimension.HORIZONTAL,
			// fitDimension: FitDimension.VERTICAL,
			patternRepeatCount: 6,
		};

		const job = new FishFrontEngrave(fishFrontParams);
		const program = job.build();
		fs.writeFileSync('output/fish.nc', program.toString());
	});
});
