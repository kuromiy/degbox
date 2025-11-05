import { useState } from "react";

interface VideoThumbnailProps {
	thumbnailPath: string;
	previewGifPath: string;
	alt?: string;
	onClick?: () => void;
	className?: string;
}

export default function VideoThumbnail({
	thumbnailPath,
	previewGifPath,
	alt = "",
	onClick,
	className = "",
}: VideoThumbnailProps) {
	const [isHovered, setIsHovered] = useState(false);

	const imageSrc = isHovered ? previewGifPath : thumbnailPath;

	return (
		<img
			src={imageSrc}
			alt={alt}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onClick={onClick}
			onKeyDown={(e) => {
				if (onClick && (e.key === "Enter" || e.key === " ")) {
					onClick();
				}
			}}
			className={`${className} ${onClick ? "cursor-pointer" : ""}`}
			role={onClick ? "button" : undefined}
			tabIndex={onClick ? 0 : undefined}
		/>
	);
}
