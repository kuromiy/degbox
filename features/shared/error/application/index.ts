export type ApplicationMessage = string;

export class ApplicationError extends Error {
	private _messaages: ApplicationMessage;

	constructor(src: string) {
		super("application error.");
		this.name = "ApplicationError";
		this._messaages = src;
	}

	public get messages() {
		return this._messaages;
	}
}
