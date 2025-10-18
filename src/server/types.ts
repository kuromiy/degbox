import type { Container } from "../../features/shared/container/index.js";
import type { ISession } from "../../features/shared/session/index.js";
import type { SessionData } from "./session.js";

export type Env = {
	Variables: {
		container: Container;
		session: ISession<SessionData>;
	};
};
