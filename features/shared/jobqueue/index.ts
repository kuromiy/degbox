export type Job<T> = {
	name: string;
	input: unknown;
	handle: () => Promise<T>;
	onError?: (error: Error) => void;
	onSuccess?: (value: T) => void;
};

export class JobQueue {
	private queue: Job<unknown>[] = [];
	private isRunning = false;

	enqueue<T>(job: Job<T>) {
		this.queue.push(job as Job<unknown>);
		this.processQueue();
	}

	private async processQueue() {
		if (this.isRunning) return;
		this.isRunning = true;

		while (this.queue.length > 0) {
			const job = this.queue.shift();
			if (!job) continue;

			try {
				const result = await job.handle();
				if (job.onSuccess) {
					job.onSuccess(result);
				}
			} catch (error) {
				if (job.onError) {
					job.onError(error as Error);
				}
			}
		}

		this.isRunning = false;
	}
}
