import { useState } from "react";
import { useNavigation } from "../../../shared/ui/navigation.context.js";

interface VideoThumbnailProps {
	thumbnailPath: string;
	previewGifPath: string;
	to: string;
	alt?: string;
}

export default function VideoThumbnail({
	thumbnailPath,
	previewGifPath,
	to,
	alt = "",
}: VideoThumbnailProps) {
	const { Link } = useNavigation();
	const [isHovered, setIsHovered] = useState(false);

	const imageSrc = isHovered ? previewGifPath : thumbnailPath;

	return (
		<Link to={to}>
			<img
				src={imageSrc}
				alt={alt}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			/>
		</Link>
	);
}
