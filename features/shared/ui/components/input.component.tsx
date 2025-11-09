import type { JSX } from "react";

type InputProps = JSX.IntrinsicElements["input"];

export function Input({ className, ...rest }: InputProps) {
	return (
		<input
			className={`rounded-lg border border-gray-300 bg-white px-4 py-2 transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-main-500 disabled:cursor-not-allowed disabled:opacity-50 ${className || ""}`}
			{...rest}
		/>
	);
}
