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
 */
export function normalizeHtml(html: string): string {
	return html
		.replace(/<link[^>]*rel="preload"[^>]*>/gi, "") // preloadタグを削除
		.replace(/\s+/g, " ") // 複数の空白を1つに
		.replace(/encType/gi, "enctype") // encTypeをenctypeに統一
		.replace(/autoComplete/gi, "autocomplete") // autoCompleteをautocompleteに統一
		.replace(/\/>/g, ">") // 自己閉じタグのスラッシュを削除
		.trim();
}
