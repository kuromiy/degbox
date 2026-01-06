import type { Logger } from "winston";
import type { Content } from "../content/content.model.js";
import type { JobQueue } from "../shared/jobqueue/index.js";
import type { CalculatorFactory } from "./calculator/calculator.factory.js";
import type { ContentHash } from "./content.hash.model.js";
import type { ContentHashRepository } from "./content.hash.repository.js";
import type { DuplicateGroup } from "./duplicate.content.model.js";
import type { DuplicateContentRepository } from "./duplicate.content.repository.js";
import type { SimilarityScanHandler } from "./job/similarity-scan.handler.js";
import type { ScanQueueRepository } from "./scan-queue.repository.js";

export class DuplicateContentAction {
	private static readonly BATCH_THRESHOLD = 10;
	private isSimilarityScanEnqueued = false;
	private isScanning = false;

	constructor(
		private readonly logger: Logger,
		private readonly factory: CalculatorFactory,
		private readonly duplicateContentRepository: DuplicateContentRepository,
		private readonly contentHashRepository: ContentHashRepository,
		private readonly scanQueueRepository: ScanQueueRepository,
		private readonly jobQueue: JobQueue,
		private readonly similarityScanHandler: SimilarityScanHandler,
	) {}

	async register(content: Content) {
		const calculator = this.factory.create(content.type);
		const hashes = await calculator.calculate(content);

		for (const hash of hashes) {
			// ハッシュ保存
			await this.contentHashRepository.save(hash);

			// SHA-256は即時で重複グループ更新
			if (hash.type === "sha256") {
				await this.updateExactGroup(content.id, hash);
			}

			// dHashはスキャン待ちキューに追加
			if (hash.type === "dhash") {
				await this.scanQueueRepository.add(hash.id);
				await this.checkAndEnqueueScan();
			}
		}
	}

	private async checkAndEnqueueScan(): Promise<void> {
		if (this.isSimilarityScanEnqueued || this.isScanning) {
			return;
		}

		const queueCount = await this.scanQueueRepository.count();
		if (queueCount >= DuplicateContentAction.BATCH_THRESHOLD) {
			this.logger.debug("Queue threshold reached, enqueueing similarity scan", {
				queueCount,
				threshold: DuplicateContentAction.BATCH_THRESHOLD,
			});
			this.isSimilarityScanEnqueued = true;
			this.jobQueue.enqueue({
				name: "similarity-scan",
				input: {},
				handle: async () => {
					try {
						return await this.similarityScanHandler.execute();
					} finally {
						this.isSimilarityScanEnqueued = false;
					}
				},
				onError: (error) => {
					this.isSimilarityScanEnqueued = false;
					this.logger.error("Similarity scan job failed", { error });
				},
			});
		}
	}

	async runManualScan(): Promise<{ processed: number; groupsCreated: number }> {
		if (this.isScanning || this.isSimilarityScanEnqueued) {
			this.logger.warn("Similarity scan is already in progress");
			return { processed: 0, groupsCreated: 0 };
		}
		this.isScanning = true;
		try {
			return await this.similarityScanHandler.execute();
		} finally {
			this.isScanning = false;
		}
	}

	async getQueueCount(): Promise<number> {
		return this.scanQueueRepository.count();
	}

	private async updateExactGroup(contentId: string, hash: ContentHash) {
		// 同じハッシュ値を持つ既存レコードを検索
		const existing = await this.contentHashRepository.findByTypeAndValue(
			hash.type,
			hash.value,
		);

		const others = existing.filter((h) => h.contentId !== contentId);
		if (others.length === 0) return;

		// 全てのothersについて既存グループを検索
		const groupResults = await Promise.all(
			others.map(async (other) => ({
				contentId: other.contentId,
				group: await this.duplicateContentRepository.findByContentIdAndHashType(
					other.contentId,
					hash.type,
				),
			})),
		);

		// 既存グループを収集（重複排除）
		const existingGroups = new Map<string, DuplicateGroup>();
		for (const result of groupResults) {
			if (result.group) {
				existingGroups.set(result.group.id, result.group);
			}
		}

		const groupIds = Array.from(existingGroups.keys());

		if (groupIds.length > 1) {
			// 複数の既存グループが見つかった場合はエラー
			this.logger.error("Multiple existing duplicate groups found", {
				contentId,
				hashType: hash.type,
				hashValue: hash.value,
				existingGroupIds: groupIds,
			});
			throw new Error(
				`Multiple existing duplicate groups found for hash type ${hash.type}: ${groupIds.join(", ")}. Manual resolution required.`,
			);
		}

		const firstGroupId = groupIds[0];
		if (groupIds.length === 1 && firstGroupId) {
			// 既存グループに追加
			const existingGroup = existingGroups.get(firstGroupId);
			if (existingGroup) {
				// 同じcontentIdが既に存在するかチェック
				const alreadyExists = existingGroup.items.some(
					(item) => item.contentId === contentId,
				);
				if (!alreadyExists) {
					this.logger.debug("Adding content to existing duplicate group", {
						contentId,
						groupId: existingGroup.id,
					});
					existingGroup.items.push({ contentId, similarity: 100 });
					await this.duplicateContentRepository.save(existingGroup);
				}
			}
		} else {
			// 新規グループ作成
			const newGroup: DuplicateGroup = {
				id: await this.duplicateContentRepository.generateId(),
				hashType: hash.type,
				items: [
					...others.map((o) => ({ contentId: o.contentId, similarity: 100 })),
					{ contentId, similarity: 100 },
				],
			};
			this.logger.debug("Creating new duplicate group", {
				groupId: newGroup.id,
				contentIds: newGroup.items.map((i) => i.contentId),
			});
			await this.duplicateContentRepository.save(newGroup);
		}
	}
}
