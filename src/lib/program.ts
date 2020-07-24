import type { Block } from './block';

export class Program {
	protected blocks: Block[];

	constructor() {
		this.blocks = [];
	}

	addBlock(block: Block): void {
		this.blocks.push(block);
	}

	toString(): string {
		return this.blocks
			.map(block => block.toString())
			.join('\n');
	}
}

