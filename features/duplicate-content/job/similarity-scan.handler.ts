import type { Logger } from "winston";
import type { ContentHashRepository } from "../content.hash.repository.js";
import type { DuplicateGroup } from "../duplicate.content.model.js";
import type { DuplicateContentRepository } from "../duplicate.content.repository.js";
import type { HashService } from "../hash.service.js";
import type { ContentHashWithQueue } from "../scan-queue.model.js";
import type { ScanQueueRepository } from "../scan-queue.repository.js";

const SIMILARITY_THRESHOLD = 90;

export class SimilarityScanHandler {
	constructor(
		private readonly logger: Logger,
		private readonly scanQueueRepository: ScanQueueRepository,
		private readonly contentHashRepository: ContentHashRepository,
		private readonly duplicateContentRepository: DuplicateContentRepository,
		private readonly hashService: HashService,
	) {}

	async execute(): Promise<{ processed: number; groupsCreated: number }> {
		// キューからスキャン待ちのdHashを取得
		const queueItems = await this.scanQueueRepository.findWithHash();
		if (queueItems.length === 0) {
			return { processed: 0, groupsCreated: 0 };
		}

		let groupsCreated = 0;

		for (const queueItem of queueItems) {
			// バッチごとに類似ハッシュを検索（メモリ効率化）
			const similarPairs = await this.findSimilarHashesBatched(queueItem);

			if (similarPairs.length > 0) {
				const created = await this.updateOrCreateGroup(
					queueItem.contentId,
					similarPairs,
				);
				if (created) {
					groupsCreated++;
				}
			}

			// キューから削除
			await this.scanQueueRepository.remove(queueItem.queueId);
		}

		this.logger.info("Similarity scan completed", {
			processed: queueItems.length,
			groupsCreated,
		});

		return { processed: queueItems.length, groupsCreated };
	}

	private async findSimilarHashesBatched(
		queueItem: ContentHashWithQueue,
	): Promise<{ contentId: string; similarity: number }[]> {
		const similarPairs: { contentId: string; similarity: number }[] = [];

		// バッチごとにdHashを取得して比較
		for await (const batch of this.contentHashRepository.findByTypeBatched(
			"dhash",
		)) {
			for (const existingHash of batch) {
				// 自身は除外
				if (existingHash.contentId === queueItem.contentId) {
					continue;
				}

				try {
					const similarity = this.hashService.compareByHammingDistance(
						queueItem.hashValue,
						existingHash.value,
					);

					if (similarity >= SIMILARITY_THRESHOLD) {
						similarPairs.push({
							contentId: existingHash.contentId,
							similarity,
						});
					}
				} catch (error) {
					this.logger.warn("Failed to compare hashes", {
						queueContentId: queueItem.contentId,
						existingContentId: existingHash.contentId,
						error,
					});
				}
			}
		}

		return similarPairs;
	}

	private async updateOrCreateGroup(
		contentId: string,
		similarPairs: { contentId: string; similarity: number }[],
	): Promise<boolean> {
		// 類似コンテンツの既存グループを確認
		const existingGroups = new Map<string, DuplicateGroup>();

		for (const pair of similarPairs) {
			const group =
				await this.duplicateContentRepository.findByContentIdAndHashType(
					pair.contentId,
					"dhash",
				);
			if (group) {
				existingGroups.set(group.id, group);
			}
		}

		// 自身の既存グループも確認
		const ownGroup =
			await this.duplicateContentRepository.findByContentIdAndHashType(
				contentId,
				"dhash",
			);
		if (ownGroup) {
			existingGroups.set(ownGroup.id, ownGroup);
		}

		const groupIds = Array.from(existingGroups.keys());

		if (groupIds.length > 1) {
			// 複数グループが見つかった場合はマージが必要
			// データ不整合を防ぐため処理をスキップし、手動解決を促す
			this.logger.warn(
				"Multiple existing dhash groups found, skipping to prevent data inconsistency. Manual resolution required.",
				{
					contentId,
					groupIds,
				},
			);
			return false;
		}

		const firstGroupId = groupIds[0];
		if (groupIds.length >= 1 && firstGroupId) {
			// 既存グループに追加
			const existingGroup = existingGroups.get(firstGroupId);
			if (existingGroup) {
				// 新しいコンテンツを追加
				const alreadyExists = existingGroup.items.some(
					(item) => item.contentId === contentId,
				);
				if (!alreadyExists) {
					// 平均類似度を計算
					const avgSimilarity = Math.round(
						similarPairs.reduce((sum, p) => sum + p.similarity, 0) /
							similarPairs.length,
					);
					existingGroup.items.push({ contentId, similarity: avgSimilarity });
					await this.duplicateContentRepository.save(existingGroup);
					this.logger.debug("Added content to existing dhash group", {
						contentId,
						groupId: existingGroup.id,
						similarity: avgSimilarity,
					});
				}
				return false;
			}
		}

		// 新規グループ作成
		const avgSimilarity = Math.round(
			similarPairs.reduce((sum, p) => sum + p.similarity, 0) /
				similarPairs.length,
		);

		const newGroup: DuplicateGroup = {
			id: await this.duplicateContentRepository.generateId(),
			hashType: "dhash",
			items: [
				...similarPairs.map((p) => ({
					contentId: p.contentId,
					similarity: p.similarity,
				})),
				{ contentId, similarity: avgSimilarity },
			],
		};

		await this.duplicateContentRepository.save(newGroup);
		this.logger.debug("Created new dhash duplicate group", {
			groupId: newGroup.id,
			contentIds: newGroup.items.map((i) => i.contentId),
		});

		return true;
	}
}
