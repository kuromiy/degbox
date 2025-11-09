import { useState } from "react";
import {
	NeutralButton,
	PositiveButton,
} from "../../../shared/ui/components/button.component.js";
import { Modal } from "../../../shared/ui/components/modal.component.js";

export function AuthorModal({
	onAddUrl,
	onClose,
}: {
	onAddUrl: (name: string, url: string) => void;
	onClose: () => void;
}) {
	const [name, setName] = useState("");
	const [url, setUrl] = useState("");

	function reset() {
		setName("");
		setUrl("");
	}

	function register() {
		onAddUrl(name, url);
		reset();
		onClose();
	}

	return (
		<Modal onExternal={onClose}>
			<div>
				<label htmlFor="">サービス名</label>
				<input
					type="text"
					value={name}
					onChange={(e) => setName(e.currentTarget.value)}
				></input>
			</div>
			<div>
				<label htmlFor="">URL</label>
				<input
					type="text"
					value={url}
					onChange={(e) => setUrl(e.currentTarget.value)}
				></input>
			</div>
			<div>
				<NeutralButton type="button" onClick={reset}>
					リセット
				</NeutralButton>
				<PositiveButton type="button" onClick={register}>
					登録
				</PositiveButton>
			</div>
		</Modal>
	);
}
