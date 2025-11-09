import type { JSX } from "react";

type InputProps = JSX.IntrinsicElements["input"];

export function Input({ className, ...rest }: InputProps) {
	return (
		<input
			className={`px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-main-500 focus:border-transparent bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className || ""}`}
			{...rest}
		/>
	);
}
