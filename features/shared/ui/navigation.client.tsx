import type React from "react";
import { Form as RouterForm, Link as RouterLink } from "react-router-dom";
import type { LinkProps, NavigationComponents } from "./navigation.context.js";
import { NavigationProvider } from "./navigation.context.js";

/**
 * React Router用のLinkコンポーネントラッパー
 */
const ClientLink: React.FC<LinkProps> = ({ to, children, ...props }) => {
	return (
		<RouterLink to={to} {...props}>
			{children}
		</RouterLink>
	);
};

/**
 * React Router用のFormコンポーネントラッパー
 * React RouterのFormはactionに関数を受け取れる
 */
const ClientForm: React.FC<React.ComponentProps<typeof RouterForm>> = ({
	children,
	...props
}) => {
	return <RouterForm {...props}>{children}</RouterForm>;
};

const clientComponents: NavigationComponents = {
	Link: ClientLink,
	Form: ClientForm,
};

/**
 * Client(SPA)用のNavigationProvider
 * React Routerのコンポーネントをラップして提供
 */
export const ClientNavigationProvider: React.FC<{
	children: React.ReactNode;
}> = ({ children }) => {
	return (
		<NavigationProvider value={clientComponents}>{children}</NavigationProvider>
	);
};
