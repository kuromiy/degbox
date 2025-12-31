export type SuccessEvent = {
	message: string;
};

declare global {
	interface Window {
		efevent: {
			onSuccess: (cb: (value: SuccessEvent) => void) => () => void;
		};
	}
}
