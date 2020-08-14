import type { ToolController } from './types';

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
