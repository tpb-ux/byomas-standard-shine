import { useState } from "react";
import { X } from "lucide-react";

interface GalleryItem {
  type: "image" | "video";
  url: string;
  caption: string;
}

interface ProjectGalleryProps {
  gallery: GalleryItem[];
}

const ProjectGallery = ({ gallery }: ProjectGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {gallery.map((item, index) => (
          <button
            key={index}
            onClick={() => openLightbox(index)}
            className="group relative overflow-hidden bg-muted aspect-video hover:opacity-90 transition-opacity"
          >
            <img
              src={item.url}
              alt={item.caption}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="absolute bottom-0 left-0 right-0 p-4 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {item.caption}
            </p>
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
          >
            <X className="h-8 w-8" />
          </button>
          <div className="max-w-5xl w-full">
            <img
              src={gallery[selectedIndex].url}
              alt={gallery[selectedIndex].caption}
              className="w-full h-auto"
            />
            <p className="text-white text-center mt-4">
              {gallery[selectedIndex].caption}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectGallery;
