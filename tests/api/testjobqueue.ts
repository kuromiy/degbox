import { type Job, JobQueue } from "../../features/shared/jobqueue/index.js";

export class TestJobQueue extends JobQueue {
	private pendingJobs = new Set<string>();
	private jobCompletions = new Map<string, Promise<void>>();
	public successCallbacks: Array<{ name: string; value: unknown }> = [];
	public errorCallbacks: Array<{ name: string; error: Error }> = [];

	enqueue<T>(job: Job<T>) {
		const jobId = `${job.name}-${Date.now()}-${Math.random()}`;

		// 完了を追跡するためのPromiseを作成
		let resolveCompletion: () => void;
		const completion = new Promise<void>((resolve) => {
			resolveCompletion = resolve;
		});

		const wrappedJob: Job<T> = {
			...job,
			onSuccess: (result) => {
				if (job.onSuccess) {
					job.onSuccess(result);
				}
				this.successCallbacks.push({ name: job.name, value: result });
				this.pendingJobs.delete(jobId);
				resolveCompletion();
			},
			onError: (error) => {
				if (job.onError) {
					job.onError(error);
				}
				this.errorCallbacks.push({ name: job.name, error });
				this.pendingJobs.delete(jobId);
				resolveCompletion();
			},
		};

		this.pendingJobs.add(jobId);
		this.jobCompletions.set(jobId, completion);

		// 親のenqueueを呼ぶ
		super.enqueue(wrappedJob);
	}

	async waitForCompletion(): Promise<void> {
		// すべてのジョブの完了を待つ
		const completions = Array.from(this.jobCompletions.values());
		await Promise.all(completions);

		// 親クラスのキューが空になるまで待つ（念のため）
		while (this.pendingJobs.size > 0) {
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
	}

	reset() {
		this.pendingJobs.clear();
		this.jobCompletions.clear();
		this.successCallbacks = [];
		this.errorCallbacks = [];
	}
}
