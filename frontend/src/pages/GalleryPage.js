import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Heart, Images } from 'lucide-react';
import { ImageGrid } from '@/components/gallery/ImageGrid';
import { useAppStore } from '@/stores/appStore';
import { MOCK_IMAGES } from '@/utils';
export const GalleryPage = () => {
    const [images, setImages] = useState(MOCK_IMAGES);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const addToast = useAppStore((state) => state.addToast);
    const displayed = showFavoritesOnly ? images.filter((image) => image.isFavorite) : images;
    const toggleFavorite = (target) => {
        setImages((current) => current.map((image) => (image.id === target.id ? { ...image, isFavorite: !image.isFavorite } : image)));
        addToast(target.isFavorite ? 'Removed from favorites' : 'Added to favorites', 'success');
    };
    const copyPrompt = async (prompt) => {
        await navigator.clipboard.writeText(prompt);
        addToast('Prompt copied', 'success');
    };
    return (_jsxs("div", { className: "space-y-6 p-4 lg:p-6", children: [_jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { children: [_jsxs("h1", { className: "flex items-center gap-2 text-lg font-bold text-white", children: [_jsx(Images, { size: 20, className: "text-indigo-400" }), "Gallery"] }), _jsxs("p", { className: "mt-0.5 text-sm text-dark-500", children: [images.length, " images"] })] }), _jsxs("button", { type: "button", onClick: () => setShowFavoritesOnly(!showFavoritesOnly), className: `flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${showFavoritesOnly
                            ? 'border-red-500/30 bg-red-500/15 text-red-400'
                            : 'border-dark-700 bg-dark-800 text-dark-300 hover:border-dark-600 hover:text-white'}`, children: [_jsx(Heart, { size: 15, fill: showFavoritesOnly ? 'currentColor' : 'none' }), "Favorites"] })] }), _jsx(ImageGrid, { images: displayed, onFavorite: toggleFavorite, onCopyPrompt: copyPrompt, emptyMessage: showFavoritesOnly ? 'No favorites yet' : 'No images yet' })] }));
};
