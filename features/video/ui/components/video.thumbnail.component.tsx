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
	alt = "動画サムネイル",
}: VideoThumbnailProps) {
	const { Link } = useNavigation();
	const [isHovered, setIsHovered] = useState(false);

	const imageSrc = isHovered ? previewGifPath : thumbnailPath;

	return (
		<Link to={to} className="block">
			<div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-300 transition-transform duration-200 hover:scale-105">
				<img
					src={imageSrc}
					alt={alt}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					className="h-full w-full object-contain"
				/>
			</div>
		</Link>
	);
}
