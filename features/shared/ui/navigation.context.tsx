import type React from "react";
import { createContext, useContext } from "react";

/**
 * ナビゲーションコンポーネントの共通インターフェース
 * client(SPA)とserver(SSR)で実装を切り替える
 */

export interface LinkProps {
	to: string;
	children: React.ReactNode;
	className?: string;
	[key: string]: unknown;
}

export interface NavigationComponents {
	Link: React.ComponentType<LinkProps>;
	// biome-ignore lint/suspicious/noExplicitAny: Client/Serverで異なる型を許容するため
	Form: React.ComponentType<any>;
}

const NavigationContext = createContext<NavigationComponents | null>(null);

export const NavigationProvider = NavigationContext.Provider;

/**
 * ナビゲーションコンポーネントを取得するhook
 * テンプレート内でこれを使用することで、環境に応じた適切なコンポーネントを使用できる
 */
export function useNavigation(): NavigationComponents {
	const context = useContext(NavigationContext);
	if (!context) {
		throw new Error("useNavigation must be used within NavigationProvider");
	}
	return context;
}
