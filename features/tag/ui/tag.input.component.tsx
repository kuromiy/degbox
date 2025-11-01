import { isSuccess } from "electron-flow/result";
import { useEffect, useId, useMemo, useState } from "react";
import { ApiService } from "../../../src/renderer/autogenerate/register.js";

const client = new ApiService();

function useAutocompleteTags(value: string) {
	const [tags, setTags] = useState<string[]>([]);

	useEffect(() => {
		async function fetch() {
			const response = await client.autocompleteTags(value, 5);
			if (isSuccess(response)) {
				setTags(response.value.map((v) => v.name));
			}
		}

		fetch();
	}, [value]);

	return tags;
}

function useSuggestTags(value: string[]) {
	const [tags, setTags] = useState<string[]>([]);

	useEffect(() => {
		// 空配列の場合はAPIを呼ばない
		if (value.length === 0) {
			setTags([]);
			return;
		}

		async function fetch() {
			const response = await client.suggestRelatedTags(value, 5);
			if (isSuccess(response)) {
				setTags(response.value.map((v) => v.tag.name));
			}
		}

		fetch();
	}, [value]);

	return tags;
}

function useTags(initValue: string) {
	const [tags, setTags] = useState(initValue);

	const tagArray = useMemo(
		() => tags.split(/\s+/).filter((t) => t.length > 0),
		[tags],
	);

	// 最後の要素を現在入力中のタグとする
	const inputtingTag = tagArray[tagArray.length - 1] || "";

	// 最後を除いた要素を確定済みタグとする（サジェスト用）
	const confirmedTags = useMemo(() => tagArray, [tagArray]);

	function add(value: string) {
		// 既存のタグに新しいタグを追加し、スペースで区切る
		const newTags = tags.trim() ? `${tags.trim()} ${value} ` : `${value} `;
		setTags(newTags);
	}

	function replace(value: string) {
		// 確定済みタグに新しいタグを追加（現在入力中を置き換え）
		const confirmedTagsStr = tagArray.slice(0, -1).join(" ");
		const newTags = confirmedTagsStr
			? `${confirmedTagsStr} ${value} `
			: `${value} `;
		setTags(newTags);
	}

	function change(value: string) {
		setTags(value);
	}

	function reset() {
		setTags(initValue);
	}

	return { tags, inputtingTag, confirmedTags, add, replace, change, reset };
}

export function useTagInput(initValue: string) {
	const { tags, inputtingTag, confirmedTags, add, replace, change, reset } =
		useTags(initValue);

	const autocompleteTags = useAutocompleteTags(inputtingTag);
	const suggestTags = useSuggestTags(confirmedTags);

	return { tags, add, replace, change, reset, autocompleteTags, suggestTags };
}

export function TagInput({
	name,
	value,
	onAdd,
	onReplace,
	onChange,
	autocompleteTags,
	suggestTags,
}: {
	name: string;
	value: string;
	onAdd: (valuee: string) => void;
	onReplace: (value: string) => void;
	onChange: (value: string) => void;
	autocompleteTags: string[];
	suggestTags: string[];
}) {
	const id = useId();

	return (
		<TagInputPresention
			id={id}
			name={name}
			value={value}
			onAdd={onAdd}
			onReplace={onReplace}
			onChange={onChange}
			autocompleteTags={autocompleteTags}
			suggestTags={suggestTags}
		/>
	);
}

function TagInputPresention({
	id,
	name,
	value,
	onAdd,
	onReplace,
	onChange,
	autocompleteTags,
	suggestTags,
}: {
	id: string;
	name: string;
	value: string;
	onAdd: (value: string) => void;
	onReplace: (value: string) => void;
	onChange: (value: string) => void;
	autocompleteTags: string[];
	suggestTags: string[];
}) {
	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id}>タグ</label>

			{/* タグ入力 */}
			<input
				id={id}
				name={name}
				type="text"
				className="px-4 py-2 border rounded-lg"
				placeholder="タグを入力（スペース区切りで複数入力可）..."
				autoComplete="off"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>

			{/* オートコンプリート */}
			{autocompleteTags.length !== 0 && (
				<div className="flex flex-col">
					{autocompleteTags.map((tag, index) => {
						return (
							<button
								type="button"
								className="px-4 py-2 border"
								key={index.toString()}
								onClick={() => onReplace(tag)}
							>
								{tag}
							</button>
						);
					})}
				</div>
			)}

			{/* サジェスト */}
			{suggestTags.length !== 0 && (
				<div className="flex flex-wrap gap-2">
					{suggestTags.map((tag, index) => {
						return (
							<button
								type="button"
								className="px-4 py-2 border"
								key={index.toString()}
								onClick={() => onAdd(tag)}
							>
								{tag}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}
