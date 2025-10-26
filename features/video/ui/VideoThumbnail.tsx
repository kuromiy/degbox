import { useState } from "react";

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
		? `http://localhost:8080/file/${previewGifPath}`
		: `http://localhost:8080/file/${thumbnailPath}`;

	return (
		<img
			src={imageSrc}
			alt={alt}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		/>
	);
}
