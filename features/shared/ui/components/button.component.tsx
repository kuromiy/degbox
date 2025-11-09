import type { JSX } from "react";

type ButtonProps = JSX.IntrinsicElements["button"];

export function PositiveButton(props: ButtonProps) {
	const { className, ...rest } = props;
	const mergedClassName = className
		? `cursor-pointer rounded-lg bg-main-500 px-4 py-2 font-medium text-white transition-colors hover:bg-main-600 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2 active:bg-main-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`
		: "cursor-pointer rounded-lg bg-main-500 px-4 py-2 font-medium text-white transition-colors hover:bg-main-600 focus:outline-none focus:ring-2 focus:ring-main-500 focus:ring-offset-2 active:bg-main-700 disabled:cursor-not-allowed disabled:opacity-50";
	return <button className={mergedClassName} {...rest} />;
}

export function NegativeButton(props: ButtonProps) {
	const { className, ...rest } = props;
	const mergedClassName = className
		? `cursor-pointer rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 ${className}`
		: "cursor-pointer rounded-lg bg-red-500 px-4 py-2 font-medium text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 active:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";
	return <button className={mergedClassName} {...rest} />;
}

export function NeutralButton(props: ButtonProps) {
	const { className, ...rest } = props;
	const mergedClassName = className
		? `cursor-pointer rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50 ${className}`
		: "cursor-pointer rounded-lg bg-gray-200 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 active:bg-gray-400 disabled:cursor-not-allowed disabled:opacity-50";
	return <button className={mergedClassName} {...rest} />;
}
