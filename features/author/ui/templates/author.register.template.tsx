import { useState } from "react";
import { FieldError } from "../../../../src/renderer/components/field-error.component.js";
import {
	NeutralButton,
	PositiveButton,
} from "../../../shared/ui/components/button.component.js";
import { Input } from "../../../shared/ui/components/input.component.js";
import { useNavigation } from "../../../shared/ui/navigation.context.js";
import { AuthorModal } from "../components/author.modal.component.js";
import {
	AuthorUrlsInput,
	useAuthorUrls,
} from "../components/author.urls.input.component.js";

interface AuthorRegisterTemplateProps {
	fieldErrors?: Record<string, string[]> | undefined;
	generalError?: string | undefined;
}

export function AuthorRegisterTemplate({
	fieldErrors,
	generalError,
}: AuthorRegisterTemplateProps) {
	const [isOpen, setIsOpen] = useState(false);
	const { urls, add, remove } = useAuthorUrls();
	const { Form } = useNavigation();

	return (
		<main className="flex justify-center">
			{isOpen && (
				<AuthorModal onAddUrl={add} onClose={() => setIsOpen(false)} />
			)}
			<div className="w-full max-w-md">
				{generalError && (
					<div className="mb-4 rounded bg-red-100 p-3 text-red-700">
						{generalError}
					</div>
				)}
				<Form className="flex flex-col gap-4" method="POST">
					<h1>作者登録</h1>
					<div>
						<label htmlFor="name">名前</label>
						<Input name="name" type="text" />
						<FieldError errors={fieldErrors?.name} />
					</div>
					<AuthorUrlsInput
						urls={urls}
						onAddClick={() => setIsOpen(true)}
						onRemoveClick={remove}
					/>
					<FieldError errors={fieldErrors?.urls} />
					<div className="flex gap-4">
						<NeutralButton type="reset">リセット</NeutralButton>
						<PositiveButton type="submit">登録</PositiveButton>
					</div>
				</Form>
			</div>
		</main>
	);
}
