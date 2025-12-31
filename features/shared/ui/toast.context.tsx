import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { EventService } from "../../../src/renderer/autogenerate/renderer-events.js";
import { Toast, type ToastType } from "./components/toast.component.js";

type ToastItem = {
	id: string;
	type: ToastType;
	message: string;
};

type ToastContextValue = {
	addToast: (type: ToastType, message: string) => void;
	removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 5000;

export function useToast() {
	const context = useContext(ToastContext);
	if (!context) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
}

type ToastProviderProps = {
	children: React.ReactNode;
};

export function ToastProvider({ children }: ToastProviderProps) {
	const [toasts, setToasts] = useState<ToastItem[]>([]);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const addToast = useCallback(
		(type: ToastType, message: string) => {
			const id = crypto.randomUUID();
			setToasts((prev) => [...prev, { id, type, message }]);

			setTimeout(() => {
				removeToast(id);
			}, TOAST_DURATION);
		},
		[removeToast],
	);

	return (
		<ToastContext.Provider value={{ addToast, removeToast }}>
			{children}
			{/* Toast Container - 画面右上に固定 */}
			<div className="pointer-events-none fixed top-4 right-4 z-50 flex flex-col gap-2">
				{toasts.map((toast) => (
					<div key={toast.id} className="pointer-events-auto">
						<Toast
							id={toast.id}
							type={toast.type}
							message={toast.message}
							onClose={removeToast}
						/>
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

/**
 * メインプロセスからのイベントをトーストとして表示するブリッジコンポーネント
 */
export function MainProcessEventBridge() {
	const { addToast } = useToast();

	useEffect(() => {
		const eventService = new EventService();
		const cleanup = eventService.onMessage((event) => {
			addToast(event.type, event.message);
		});
		return cleanup;
	}, [addToast]);

	return null;
}
