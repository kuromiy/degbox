import Hls from "hls.js";
import { useEffect, useRef } from "react";

interface VideoPlayerProps {
	src: string;
	className?: string;
}

/**
 * HLS対応の動画プレーヤーコンポーネント
 *
 * HLS.jsを使用してHLSストリーミングに対応。
 * ブラウザがネイティブHLS対応の場合はそちらを使用し、
 * 非対応の場合はHLS.jsでポリフィルを提供。
 */
export function VideoPlayer({ src, className = "" }: VideoPlayerProps) {
	const videoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const video = videoRef.current;
		if (!video) return;

		// HLSソースかどうかを判定（.m3u8拡張子）
		const isHLS = src.endsWith(".m3u8");

		if (isHLS) {
			// HLS.jsがサポートされている場合
			if (Hls.isSupported()) {
				const hls = new Hls({
					enableWorker: true,
					lowLatencyMode: true,
				});
				hls.loadSource(src);
				hls.attachMedia(video);

				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					// マニフェストが読み込まれたら自動再生はせず、ユーザー操作を待つ
				});

				hls.on(Hls.Events.ERROR, (_event, data) => {
					if (data.fatal) {
						switch (data.type) {
							case Hls.ErrorTypes.NETWORK_ERROR:
								console.error("ネットワークエラー:", data);
								hls.startLoad();
								break;
							case Hls.ErrorTypes.MEDIA_ERROR:
								console.error("メディアエラー:", data);
								hls.recoverMediaError();
								break;
							default:
								console.error("致命的なエラー:", data);
								hls.destroy();
								break;
						}
					}
				});

				return () => {
					hls.destroy();
				};
			}
			// SafariなどネイティブHLS対応ブラウザの場合
			if (video.canPlayType("application/vnd.apple.mpegurl")) {
				video.src = src;
			} else {
				console.error("このブラウザはHLSをサポートしていません");
			}
		} else {
			// HLS以外の通常の動画ファイル
			video.src = src;
		}
	}, [src]);

	return (
		<video
			ref={videoRef}
			className={className}
			controls
			style={{
				width: "100%",
				maxHeight: "70vh",
				backgroundColor: "#000",
			}}
		>
			<track kind="captions" />
			お使いのブラウザは動画タグをサポートしていません。
		</video>
	);
}
