import { failure, success } from "electron-flow/result";
import type { Tag } from "../../features/tag/tag.model.js";
import type { TagSuggestion } from "../../features/tag/tag.suggestion.service.js";
import type { ServiceIF } from "../renderer/autogenerate/register.js";

const BASE_URL = "http://192.168.3.33:8080";

export class FetchClient implements ServiceIF {
	async searchAuthor(
		_name: string | undefined,
		_page: number | undefined,
		_size: number | undefined,
	) {
		return failure(new Error("searchAuthor is not allowed in FetchClient"));
	}

	async registerAuthor(_name: string, _urls: string) {
		return failure(new Error("registerAuthor is not allowed in FetchClient"));
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
		_resourceId: string,
		_rawTags: string,
		_authorId: string | undefined,
	) {
		return failure(new Error("registerVideo is not allowed in FetchClient"));
	}

	async detailVideo(_videoId: string) {
		return failure(new Error("detailVideo is not allowed in FetchClient"));
	}

	async searchVideo(
		_keyword: string | undefined,
		_page: number | undefined,
		_size: number | undefined,
	) {
		return failure(new Error("searchVideo is not allowed in FetchClient"));
	}
}
