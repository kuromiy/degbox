export type Message = {
	type: "success" | "error" | "info" | "warning";
	message: string;
};
export type onMessage = (message: Message) => void;
