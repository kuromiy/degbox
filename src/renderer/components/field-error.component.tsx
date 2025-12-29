interface FieldErrorProps {
	errors?: string[] | undefined;
}

export function FieldError({ errors }: FieldErrorProps) {
	if (!errors || errors.length === 0) {
		return null;
	}

	return (
		<div className="mt-1 text-red-600 text-sm">
			{errors.map((error) => (
				<p key={error}>{error}</p>
			))}
		</div>
	);
}
