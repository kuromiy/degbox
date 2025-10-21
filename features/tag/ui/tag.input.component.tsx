interface TagInputProps
	extends Omit<
		React.InputHTMLAttributes<HTMLInputElement>,
		"id" | "name" | "type"
	> {
	id?: string;
	name?: string;
	defaultValue?: string;
	hasError?: boolean;
}

export function TagInput({
	id = "tags",
	name = "tags",
	defaultValue,
	hasError,
	...rest
}: TagInputProps) {
	return (
		<div className="flex flex-col gap-1">
			<label htmlFor={id}>タグ</label>
			<input
				type="text"
				id={id}
				name={name}
				defaultValue={defaultValue}
				aria-invalid={hasError ? "true" : "false"}
				className={`w-full px-4 py-2 border rounded-lg ${hasError ? "border-red-500" : ""}`}
				placeholder="タグを入力..."
				{...rest}
			/>
		</div>
	);
}
