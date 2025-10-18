interface TagInputProps {
	defaultValue?: string;
	hasError?: boolean;
}

export function TagInput({ defaultValue, hasError }: TagInputProps) {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor="tags">タグ</label>
			<input
				type="text"
				name="tags"
				defaultValue={defaultValue}
				className={`w-full px-4 py-2 border rounded-lg ${hasError ? "border-red-500" : ""}`}
				placeholder="タグを入力..."
			/>
		</div>
	);
}
