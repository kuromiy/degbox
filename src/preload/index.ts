import { contextBridge } from "electron";
import autoEVENTS from "./autogenerate/preload-events.js";
import autoAPIS from "./autogenerate/register.js";

contextBridge.exposeInMainWorld("api", {
	...autoAPIS,
});

contextBridge.exposeInMainWorld("events", {
	...autoEVENTS,
});
