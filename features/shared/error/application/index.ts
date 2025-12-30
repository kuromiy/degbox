export type ApplicationMessage = string;

export class ApplicationError extends Error {
	private _messages: ApplicationMessage;

	constructor(src: string) {
		super("application error.");
		this.name = "ApplicationError";
		this._messages = src;
	}

	public get messages() {
		return this._messages;
	}
}
