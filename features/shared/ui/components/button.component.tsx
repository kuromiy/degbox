import type { JSX } from "react";

type ButtonProps = JSX.IntrinsicElements["button"];

export function PositiveButton(props: ButtonProps) {
	return (
		<button
			className="px-4 py-2 rounded-lg bg-main-500 text-white font-medium transition-colors hover:bg-main-600 active:bg-main-700 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			{...props}
		/>
	);
}

export function NegativeButton(props: ButtonProps) {
	return (
		<button
			className="px-4 py-2 rounded-lg bg-red-500 text-white font-medium transition-colors hover:bg-red-600 active:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			{...props}
		/>
	);
}

export function NeutralButton(props: ButtonProps) {
	return (
		<button
			className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium transition-colors hover:bg-gray-300 active:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
			{...props}
		/>
	);
}
