import type { Block } from './block';

export class Program {
	protected blocks: Block[];

	constructor() {
		this.blocks = [];
	}

	addBlock(block: Block): this {
		this.blocks.push(block);
		return this;
	}

	toString(): string {
		return this.blocks
			.map(block => block.toString())
			.join('\n');
	}

	getEstimatedRuntimeSec (): number {
		return this.blocks.reduce((sum, block) => {
			return sum + block.getEstimatedRuntimeSec();
		}, 0);
	}
}

