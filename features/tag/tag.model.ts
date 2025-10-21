export type Tag = {
	id: string;
	name: string;
};

export namespace Tag {
	export function split(value: string) {
		return value.split(/\s+/).filter((tag) => tag.length > 0);
	}
}
