import { AxisDir, Point } from 'lib/index';
import type { Front } from './types';

export const FRONTS: { [id: string]: Front } = {
	besta_597_381: {
		id: 'besta_597_381',
		family: 'Bestå',
		width: 597,
		height: 381,
		reversable: true,
		hinges: [
			{ pos: new Point(-22.5, -100), dir: AxisDir.X_NEG },
			{ pos: new Point(-22.5, -300), dir: AxisDir.X_NEG },
		],
	},
};
