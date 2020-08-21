import type { ToolController } from 'job/index';

export function isSet<T>(val?: T): val is T {
	return typeof val !== 'undefined';
}

export function isOdd(n: number): boolean {
	return Boolean(n % 2);
}

export function getStepdownDepths (
	toolCtrl: ToolController,
	finalDepth: number,
): number[] {
	const passes = Math.ceil(finalDepth / toolCtrl.stepdown);
	const perPass = finalDepth / passes;

	const depths: number[] = [];

	for (let depth = -perPass; depth >= -finalDepth; depth -= perPass) {
		depths.push(depth);
	}

	return depths;
}
