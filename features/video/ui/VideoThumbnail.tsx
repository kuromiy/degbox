import { useState } from "react";
import { buildFileUrl } from "../../../src/renderer/config/index.js";

interface VideoThumbnailProps {
	thumbnailPath: string;
	previewGifPath: string;
	alt?: string;
}

export default function VideoThumbnail({
	thumbnailPath,
	previewGifPath,
	alt = "",
}: VideoThumbnailProps) {
	const [isHovered, setIsHovered] = useState(false);

	const imageSrc = isHovered
		? buildFileUrl(previewGifPath)
		: buildFileUrl(thumbnailPath);

	return (
		<img
			src={imageSrc}
			alt={alt}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		/>
	);
}
