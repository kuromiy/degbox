import { failure, success } from "electron-flow/result";
import type { Tag } from "../../features/tag/tag.model.js";
import type { TagSuggestion } from "../../features/tag/tag.suggestion.service.js";
import type { ServiceIF } from "../renderer/autogenerate/register.js";

const BASE_URL = "http://192.168.3.33:8080";

export class FetchClient implements ServiceIF {
	async searchAuthor(
		name: string | undefined,
		page: number | undefined,
		size: number | undefined,
	) {
		try {
			const params = new URLSearchParams({
				...(name !== undefined && { name }),
				...(page !== undefined && { page: page.toString() }),
				...(size !== undefined && { size: size.toString() }),
			});
			const response = await fetch(`${BASE_URL}/api/author/search?${params}`);

			if (!response.ok) {
				return failure(new Error(`HTTP error! status: ${response.status}`));
			}

			const result = await response.json();
			return success(result);
		} catch (error) {
			return failure(error instanceof Error ? error : new Error(String(error)));
		}
	}

	async registerAuthor(_name: string, _urls: string) {
		return failure(new Error("registerAuthor is not allowed in FetchClient"));
	}

	async updateAuthor(_id: string, _name: string, _urls: string) {
		return failure(new Error("updateAuthor is not allowed in FetchClient"));
	}

	async getAuthorDetail(
		_authorId: string,
		_videoPage: number | undefined,
		_videoSize: number | undefined,
	) {
		return failure(new Error("getAuthorDetail is not allowed in FetchClient"));
	}

	async deleteAuthor(_id: string) {
		return failure(new Error("deleteAuthor is not allowed in FetchClient"));
	}

	async autocompleteTags(value: string, limit: number | undefined) {
		try {
			const params = new URLSearchParams({
				value,
				...(limit !== undefined && { limit: limit.toString() }),
			});
			const response = await fetch(
				`${BASE_URL}/api/tag/autocomplete?${params}`,
			);

			if (!response.ok) {
				return failure(new Error(`HTTP error! status: ${response.status}`));
			}

			const tags = (await response.json()) as Tag[];
			return success(tags);
		} catch (error) {
			return failure(error instanceof Error ? error : new Error(String(error)));
		}
	}

	async suggestRelatedTags(tagNames: unknown[], limit: number | undefined) {
		try {
			const response = await fetch(`${BASE_URL}/api/tag/suggest`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					tagNames,
					...(limit !== undefined && { limit }),
				}),
			});

			if (!response.ok) {
				return failure(new Error(`HTTP error! status: ${response.status}`));
			}

			const suggestions = (await response.json()) as TagSuggestion[];
			return success(suggestions);
		} catch (error) {
			return failure(error instanceof Error ? error : new Error(String(error)));
		}
	}

	async pickupVideo() {
		return failure(new Error("pickupVideo is not allowed in FetchClient"));
	}

	async registerVideo(
		_resourceIds: unknown[],
		_rawTags: string,
		_authorIds: unknown[] | undefined,
	) {
		return failure(new Error("registerVideo is not allowed in FetchClient"));
	}

	async pickupImage() {
		return failure(new Error("pickupImage is not allowed in FetchClient"));
	}

	async detailIllust(_illustId: string) {
		return failure(new Error("detailIllust is not allowed in FetchClient"));
	}

	async registerIllust(
		_resourceIds: unknown[],
		_rawTags: string,
		_authorIds: unknown[] | undefined,
	) {
		return failure(new Error("registerIllust is not allowed in FetchClient"));
	}

	async updateIllust(
		_id: string,
		_tags: string,
		_imageItems: unknown[],
		_authorIds: unknown[],
	) {
		return failure(new Error("updateIllust is not allowed in FetchClient"));
	}

	async searchIllust(
		_tag: string | undefined,
		_sortBy: string | undefined,
		_order: string | undefined,
		_page: number | undefined,
		_limit: number | undefined,
	) {
		return failure(new Error("searchIllust is not allowed in FetchClient"));
	}

	async deleteIllust(illustId: string) {
		try {
			const response = await fetch(
				`${BASE_URL}/illust/detail/${illustId}/delete`,
				{
					method: "POST",
				},
			);

			if (!response.ok) {
				return failure(new Error(`HTTP error! status: ${response.status}`));
			}

			const result = await response.json();
			return success(result);
		} catch (error) {
			return failure(error instanceof Error ? error : new Error(String(error)));
		}
	}

	async detailVideo(_videoId: string) {
		return failure(new Error("detailVideo is not allowed in FetchClient"));
	}

	async searchVideo(
		_keyword: string | undefined,
		_sortBy: string | undefined,
		_order: string | undefined,
		_page: number | undefined,
		_size: number | undefined,
	) {
		return failure(new Error("searchVideo is not allowed in FetchClient"));
	}

	async getAppSetting() {
		return failure(new Error("getAppSetting is not allowed in FetchClient"));
	}

	async updateAppSetting(_ffmpegPath: string) {
		return failure(new Error("updateAppSetting is not allowed in FetchClient"));
	}

	async getRecentProject() {
		return failure(new Error("getRecentProject is not allowed in FetchClient"));
	}

	async registerProject() {
		return failure(new Error("registerProject is not allowed in FetchClient"));
	}
}
