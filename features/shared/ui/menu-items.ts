/**
 * サイドメニュー項目の定義
 */

export interface MenuItem {
	to: string;
	label: string;
}

export interface MenuCategory {
	category: string;
	items: MenuItem[];
}

export const menuItems: MenuCategory[] = [
	{
		category: "動画",
		items: [
			{ to: "/video/search", label: "動画検索" },
			{ to: "/video/register", label: "動画登録" },
		],
	},
	{
		category: "イラスト",
		items: [{ to: "/illust/register", label: "イラスト登録" }],
	},
	{
		category: "作者",
		items: [
			{ to: "/author/search", label: "作者検索" },
			{ to: "/author/register", label: "作者登録" },
		],
	},
];
