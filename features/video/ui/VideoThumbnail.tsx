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

	const imageSrc = isHovered ? previewGifPath : thumbnailPath;

	return (
		<img
			src={imageSrc}
			alt={alt}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
		/>
	);
}
