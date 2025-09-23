import { contextBridge } from "electron";
import autoAPIS from "./autogenerate/register.js";

contextBridge.exposeInMainWorld("api", {
	...autoAPIS,
});
