import type React from "react";
import type { LinkProps, NavigationComponents } from "./navigation.context.js";
import { NavigationProvider } from "./navigation.context.js";

/**
 * SSR用の標準aタグラッパー
 */
const ServerLink: React.FC<LinkProps> = ({ to, children, ...props }) => {
	return (
		<a href={to} {...props}>
			{children}
		</a>
	);
};

/**
 * SSR用の標準formタグラッパー
 * 標準のformはactionに文字列のみ受け取る
 */
const ServerForm: React.FC<React.ComponentProps<"form">> = ({
	children,
	...props
}) => {
	return <form {...props}>{children}</form>;
};

const serverComponents: NavigationComponents = {
	Link: ServerLink,
	Form: ServerForm,
};

/**
 * Server(SSR)用のNavigationProvider
 * 標準のHTML要素をラップして提供
 */
export const ServerNavigationProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	return (
		<NavigationProvider value={serverComponents}>{children}</NavigationProvider>
	);
};
