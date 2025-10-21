import { createFactory } from "hono/factory";
import type { Env } from "./types.js";

export const factory = createFactory<Env>();
