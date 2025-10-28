import { useEffect, useRef, useState } from "react";

interface Tag {
	id: string;
	name: string;
}

interface TagSuggestion {
	tag: Tag;
	score: number;
}

interface TagInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"id" | "name" | "type"
	> {
	id?: string;
	name?: string;
	defaultValue?: string;
	hasError?: boolean;
	onTagsChange?: (tags: Tag[]) => void;
	apiClient?: {
		autocompleteTags: (value: string, limit?: number) => Promise<Tag[]>;
		suggestRelatedTags: (
			tagNames: string[],
			limit?: number,
		) => Promise<TagSuggestion[]>;
	};
}

export function TagInput({
	id = "tags",
	name = "tags",
	defaultValue,
	hasError,
	onTagsChange,
	apiClient,
	...rest
}: TagInputProps) {
	const [inputValue, setInputValue] = useState("");
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [autocompleteList, setAutocompleteList] = useState<Tag[]>([]);
	const [relatedSuggestions, setRelatedSuggestions] = useState<TagSuggestion[]>(
		[],
	);
	const [showAutocomplete, setShowAutocomplete] = useState(false);
	const inputRef = useRef<HTMLInputElement>(null);

	// 選択されたタグ名を結合してhidden inputに保存
	const tagsValue = selectedTags.map((tag) => tag.name).join(" ");

	// オートコンプリート
	useEffect(() => {
		if (!apiClient || !inputValue.trim()) {
			setAutocompleteList([]);
			setShowAutocomplete(false);
			return;
		}

		const fetchAutocomplete = async () => {
			try {
				const results = await apiClient.autocompleteTags(inputValue, 10);
				// 既に選択済みのタグを除外
				const filtered = results.filter(
					(tag) => !selectedTags.some((selected) => selected.id === tag.id),
				);
				setAutocompleteList(filtered);
				setShowAutocomplete(filtered.length > 0);
			} catch (error) {
				console.error("Autocomplete error:", error);
			}
		};

		const timer = setTimeout(fetchAutocomplete, 200);
		return () => clearTimeout(timer);
	}, [inputValue, apiClient, selectedTags]);

	// 関連タグサジェスト
	useEffect(() => {
		if (!apiClient || selectedTags.length === 0) {
			setRelatedSuggestions([]);
			return;
		}

		const fetchRelatedTags = async () => {
			try {
				const tagNames = selectedTags.map((tag) => tag.name);
				const results = await apiClient.suggestRelatedTags(tagNames, 5);
				// 既に選択済みのタグを除外
				const filtered = results.filter(
					(suggestion) =>
						!selectedTags.some((selected) => selected.id === suggestion.tag.id),
				);
				setRelatedSuggestions(filtered);
			} catch (error) {
				console.error("Related tags error:", error);
			}
		};

		fetchRelatedTags();
	}, [selectedTags, apiClient]);

	// タグを追加
	const addTag = (tag: Tag) => {
		const newTags = [...selectedTags, tag];
		setSelectedTags(newTags);
		setInputValue("");
		setShowAutocomplete(false);
		onTagsChange?.(newTags);
		inputRef.current?.focus();
	};

	// タグを削除
	const removeTag = (tagId: string) => {
		const newTags = selectedTags.filter((tag) => tag.id !== tagId);
		setSelectedTags(newTags);
		onTagsChange?.(newTags);
	};

	// Enterキーでタグ追加（オートコンプリートがある場合は最初の候補を選択）
	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const firstTag = autocompleteList[0];
			if (firstTag) {
				addTag(firstTag);
			}
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<label htmlFor={id}>タグ</label>

			{/* 選択済みタグ表示 */}
			{selectedTags.length > 0 && (
				<div className="flex flex-wrap gap-2">
					{selectedTags.map((tag) => (
						<span
							key={tag.id}
							className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
						>
							{tag.name}
							<button
								type="button"
								onClick={() => removeTag(tag.id)}
								className="hover:text-blue-600"
								aria-label={`${tag.name}を削除`}
							>
								×
							</button>
						</span>
					))}
				</div>
			)}

			{/* タグ入力 */}
			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					id={id}
					name={name}
					value={inputValue}
					onChange={(e) => setInputValue(e.target.value)}
					onKeyDown={handleKeyDown}
					aria-invalid={hasError ? "true" : "false"}
					className={`w-full px-4 py-2 border rounded-lg ${hasError ? "border-red-500" : ""}`}
					placeholder="タグを入力..."
					autoComplete="off"
					{...rest}
				/>

				{/* オートコンプリートドロップダウン */}
				{showAutocomplete && (
					<div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
						{autocompleteList.map((tag) => (
							<button
								key={tag.id}
								type="button"
								onClick={() => addTag(tag)}
								className="w-full px-4 py-2 text-left hover:bg-gray-100"
							>
								{tag.name}
							</button>
						))}
					</div>
				)}
			</div>

			{/* 関連タグサジェスト */}
			{relatedSuggestions.length > 0 && (
				<div className="flex flex-col gap-2">
					<span className="text-sm text-gray-600">おすすめタグ</span>
					<div className="flex flex-wrap gap-2">
						{relatedSuggestions.map(({ tag, score }) => (
							<button
								key={tag.id}
								type="button"
								onClick={() => addTag(tag)}
								className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm flex items-center gap-1"
							>
								{tag.name}
								<span className="text-xs text-gray-500">
									{"★".repeat(Math.min(score, 3))}
								</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* hidden input for form submission */}
			<input type="hidden" name={name} value={tagsValue} />
		</div>
	);
}
