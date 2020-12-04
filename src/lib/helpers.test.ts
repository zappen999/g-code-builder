import { expect } from 'chai';
import type { ToolController } from 'job/index';
import { getStepdownDepths } from './helpers';

function getToolController (stepdown: number): ToolController {
	return {
		tool: {
			id: 1,
			name: 'Test',
			diameter: 8,
		},
		spindleSpeed: 24000,
		feedrate: 1200,
		stepdown,
	}
}

const CTRL1 = getToolController(10);
const CTRL2 = getToolController(5);

describe('Helpers', () => {
	describe('#getStepdownDepths', () => {
		it('should split up into multiple depths', () => {
			const depths = getStepdownDepths(CTRL1, 20);
			expect(depths.length).to.equal(2);
		});

		it('should end up on final depth', () => {
			const depths = getStepdownDepths(CTRL1, 20);
			expect(depths[depths.length - 1]).to.equal(-20);
		});

		it('should handle cases where just one depth needed', () => {
			const depths = getStepdownDepths(CTRL1, 5);
			expect(depths.length).to.equal(1);
			expect(depths[depths.length - 1]).to.equal(-5);
		});

		it('should handle fractions', () => {
			const depths = getStepdownDepths(CTRL2, 1.5);
			expect(depths.length).to.equal(1);
			expect(depths[depths.length - 1]).to.equal(-1.5);
		});
	});
});
