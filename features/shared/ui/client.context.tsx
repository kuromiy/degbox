import { createContext, useContext, useMemo } from "react";
import type { ServiceIF } from "../../../src/renderer/autogenerate/register.js";

export const ClientContext = createContext<ServiceIF | undefined>(undefined);

export function useClient() {
	const context = useContext(ClientContext);
	if (!context) {
		throw new Error("Client Context is undefined.");
	}
	return context;
}

type ClientProviderProps = {
	children: React.ReactNode;
	createClient: () => ServiceIF;
};

export function ClientProvider({
	children,
	createClient,
}: ClientProviderProps) {
	// クライアント側でのみクライアントをインスタンス化
	const client = useMemo(() => {
		// サーバーサイドでは undefined を返す
		if (typeof window === "undefined") {
			return undefined;
		}
		const newClient = createClient();
		return newClient;
	}, [createClient]);

	return (
		<ClientContext.Provider value={client}>{children}</ClientContext.Provider>
	);
}
