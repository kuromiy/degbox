import { isSuccess } from "electron-flow/result";
import { useContext, useEffect, useState } from "react";
import { ClientContext } from "../../../shared/ui/client.context.js";
import { Modal } from "../../../shared/ui/modal.component.js";
import type { AuthorWithVideoCount } from "../../author.model.js";

function useAuthorSelect() {
	const client = useContext(ClientContext);
	const [keyword, setKeyword] = useState("");
	const [result, setResult] = useState<AuthorWithVideoCount[]>([]);

	useEffect(() => {
		if (!client) {
			return;
		}

		async function fetch() {
			if (!client) {
				return;
			}

			const response = await client.searchAuthor(keyword, 1, 10);
			if (isSuccess(response)) {
				setResult(response.value.result);
			} else {
				console.log(response.value);
			}
		}

		fetch();
	}, [client, keyword]);

	return { result, setKeyword };
}

export function AuthorSelectModal({
	onClose,
	onSelected,
	initialAuthorId,
}: {
	onClose: () => void;
	onSelected: (author: AuthorWithVideoCount) => void;
	initialAuthorId?: string;
}) {
	const [selectId, setSelectId] = useState(initialAuthorId ?? "");
	const { result, setKeyword } = useAuthorSelect();

	function onClick() {
		const selectedAuthor = result.find((author) => author.id === selectId);
		if (selectedAuthor) {
			onSelected(selectedAuthor);
		}
		onClose();
	}

	return (
		<Modal onExternal={onClose}>
			<div>
				<label htmlFor="">作者名</label>
				<input type="text" onChange={(e) => setKeyword(e.target.value)}></input>
			</div>
			<div>
				{result.length === 0 && <div>作者がいません。</div>}
				{result.map((value) => (
					<button
						className="flex items-center"
						key={value.id}
						type="button"
						onClick={() => setSelectId(value.id)}
						style={{
							cursor: "pointer",
							backgroundColor:
								selectId === value.id ? "#e0e0e0" : "transparent",
							border: "none",
							width: "100%",
							textAlign: "left",
						}}
					>
						<input
							type="checkbox"
							checked={selectId === value.id}
							readOnly
							className="mx-2"
						/>
						<div className="px-4 py-2">{value.id}</div>
						<div className="px-4 py-2">{value.name}</div>
						<div className="px-4 py-2">{value.videoCount}</div>
					</button>
				))}
			</div>
			<button type="button" onClick={onClick}>
				選択
			</button>
		</Modal>
	);
}
