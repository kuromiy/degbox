import type { JSX } from "react";

type ButtonProps = JSX.IntrinsicElements["button"];

export function PositiveButton(props: ButtonProps) {
	return <button className="px-4 py-2 border rounded-lg" {...props} />;
}

export function NegativeButton(props: ButtonProps) {
	return <button className="px-4 py-2 border rounded-lg" {...props} />;
}

export function NeutralButton(props: ButtonProps) {
	return <button className="px-4 py-2 border rounded-lg" {...props} />;
}
