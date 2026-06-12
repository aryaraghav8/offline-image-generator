import { Clock, Heart, ImageIcon } from 'lucide-react';
import type { GeneratedImage } from '@/types';
import { formatDateTime } from '@/utils';

interface ImageCardProps {
  image: GeneratedImage;
}

export const ImageCard = ({ image }: ImageCardProps) => {
  return (
    <article className="group overflow-hidden rounded-lg border border-dark-700 bg-dark-800 transition-colors hover:border-dark-600">
      <div className="relative aspect-square overflow-hidden bg-dark-900">
        <img
          src={image.thumbnail || image.url}
          alt={image.prompt}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/75 to-transparent p-3 pt-10">
          <span className="inline-flex items-center gap-1 rounded-full bg-black/45 px-2 py-1 text-[10px] font-medium text-white backdrop-blur">
            <ImageIcon size={11} />
            {image.model}
          </span>
          {image.isFavorite && <Heart size={15} className="fill-plasma-light text-plasma-light" />}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 text-sm font-medium text-dark-100">{image.prompt}</p>
        <div className="flex items-center justify-between gap-2 text-[11px] text-dark-400">
          <span className="truncate">{formatDateTime(image.createdAt)}</span>
          <span className="inline-flex shrink-0 items-center gap-1">
            <Clock size={11} />
            {image.generationTime}s
          </span>
        </div>
      </div>
    </article>
  );
};
