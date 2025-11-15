/**
 * HTMLを正規化して比較可能な形式にする
 *
 * renderToStringとrenderToPipeableStreamの出力差分を吸収するために使用
 *
 * @param html - 正規化するHTML文字列
 * @returns 正規化されたHTML文字列
 *
 * 正規化処理:
 * - preloadタグを削除（renderToStringが自動生成するため）
 * - 複数の空白を1つに統一
 * - encTypeをenctypeに統一（React属性名の差分）
 * - autoCompleteをautocompleteに統一（React属性名の差分）
 * - 自己閉じタグのスラッシュを削除
 * - 画像URLを正規化（http://...プレフィックス、UUID、ファイル名サフィックスを削除）
 * - ランダムに生成されるID属性とfor属性を正規化
 * - hiddenフィールドのUUID値を正規化
 * - タグの順序を正規化（アルファベット順にソート）
 */
export function normalizeHtml(html: string): string {
	let result = html
		.replace(/<link[^>]*rel="preload"[^>]*>/gi, "") // preloadタグを削除
		.replace(/\s+/g, " ") // 複数の空白を1つに
		.replace(/encType/gi, "enctype") // encTypeをenctypeに統一
		.replace(/autoComplete/gi, "autocomplete") // autoCompleteをautocompleteに統一
		.replace(/\/>/g, ">") // 自己閉じタグのスラッシュを削除
		.replace(/http:\/\/[^/]+\/file\//g, "") // 画像URLのプレフィックスを削除
		.replace(
			/([/\\][0-9a-f]{2}[/\\][0-9a-f]{2}[/\\])[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
			"$1UUID",
		) // パス内のUUIDを正規化
		.replace(
			/src="([^"]*)\/(original|thumbnail)\.(jpg|jpeg|png|gif|webp)"/gi,
			'src="$1"',
		) // 画像URLのファイル名を削除
		.replace(
			/value="existing:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"/gi,
			'value="existing:UUID"',
		) // hiddenフィールドのUUID値を正規化
		.replace(/id="«[^"]+"/g, 'id="«NORMALIZED"') // ランダムなID属性を正規化
		.replace(/for="«[^"]+"/g, 'for="«NORMALIZED"'); // ランダムなfor属性を正規化

	// タグの順序を正規化（name="tags"のvalue属性内のスペース区切りタグをソート）
	result = result.replace(
		/(<input[^>]*name="tags"[^>]*value=")([^"]*)(")/gi,
		(_match, prefix, tags, suffix) => {
			const sortedTags = tags.split(" ").filter(Boolean).sort().join(" ");
			return prefix + sortedTags + suffix;
		},
	);

	return result.trim();
}
