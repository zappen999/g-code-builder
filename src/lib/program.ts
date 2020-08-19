import { Block } from './block';

export interface HelpInfo {
	origin?: string;
}

export class Program {
	protected blocks: Block[];

	constructor(
		protected help?: HelpInfo,
	) {
		this.blocks = [];

		if (help) {
			this.addHelpBlock();
		}
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

	protected addHelpBlock (): void {
		if (!this.help) return;

		const block = new Block();

		block.comment('>>>>>>>>>> README <<<<<<<<<<');

		if (this.help.origin) {
			block.comment(`Origin: ${this.help.origin}`);
		}

		block.comment('>>>>>>>>>>>>>><<<<<<<<<<<<<<');

		this.addBlock(block);
	}

	getEstimatedRuntimeSec (): number {
		return this.blocks.reduce((sum, block) => {
			return sum + block.getEstimatedRuntimeSec();
		}, 0);
	}
}

