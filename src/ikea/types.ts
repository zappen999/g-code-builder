import type { HingePosition } from 'job/front/index';

export interface Front {
	id: string;
	family: string; // Bestå, method etc
	reversable: boolean; // Hinges still works if front is rotated 180 deg.
	width: number;
	height: number;
	hinges: HingePosition[];
}
