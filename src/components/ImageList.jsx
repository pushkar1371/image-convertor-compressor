import React, { useState, useEffect } from 'react';
import { ImageProcessor } from '../utils/ImageProcessor';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const ImageItemComponent = ({ image, onRemove, compressionSettings }) => {
  const [thumbnail, setThumbnail] = useState('');
  const [dimensions, setDimensions] = useState(null);
  const [compressionPreview, setCompressionPreview] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    const generateThumbnail = async () => {
      try {
        const processor = new ImageProcessor();
        const thumbnailUrl = await processor.generateThumbnail(image.file, 80);
        setThumbnail(thumbnailUrl);

        // Get image dimensions
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
        };
        img.src = URL.createObjectURL(image.file);
      } catch (error) {
        console.error('Failed to generate thumbnail:', error);
      }
    };

    generateThumbnail();
  }, [image.file]);

  // Generate compression preview when settings change
  useEffect(() => {
    if (!compressionSettings.enableCompression) {
      setCompressionPreview(null);
      return;
    }

    const generateCompressionPreview = async () => {
      setIsLoadingPreview(true);
      try {
        const processor = new ImageProcessor();
        const preview = await processor.generateCompressionPreview(
          image.file, 
          compressionSettings.quality
        );

        const savings = formatFileSize(image.file.size - preview.size);

        setCompressionPreview({
          originalSize: image.file.size,
          compressedSize: preview.size,
          compressionRatio: preview.compressionRatio,
          savings
        });
      } catch (error) {
        console.error('Failed to generate compression preview:', error);
        setCompressionPreview(null);
      } finally {
        setIsLoadingPreview(false);
      }
    };

    // Debounce the preview generation
    const timer = setTimeout(generateCompressionPreview, 500);
    return () => clearTimeout(timer);
  }, [image.file, compressionSettings.enableCompression, compressionSettings.quality]);

  const getStatusIcon = () => {
    switch (image.status) {
      case 'converting': return <div className="status-icon status-converting">⟳</div>;
      case 'completed': return <div className="status-icon status-completed">✓</div>;
      case 'error': return <div className="status-icon status-error">✕</div>;
      default: return null;
    }
  };

  const getStatusStyling = () => {
    switch (image.status) {
      case 'converting': return 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'completed': return 'border-green-300 bg-gradient-to-br from-green-50 to-green-100';
      case 'error': return 'border-red-300 bg-gradient-to-br from-red-50 to-red-100';
      default: return 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md';
    }
  };

  return (
    <div className={`
      flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border-2 transition-all duration-200
      ${getStatusStyling()}
    `}>
      {/* Image Info */}
      <div className="flex items-center gap-4 flex-1 mb-4 sm:mb-0">
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt={image.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
              🖼️
            </div>
          )}
          {getStatusIcon()}
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate mb-2" title={image.name}>
            {image.name}
          </h4>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
              {formatFileSize(image.size)}
            </span>
            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md font-medium">
              {image.extension.toUpperCase()}
            </span>
            {dimensions && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-md font-medium">
                {dimensions.width} × {dimensions.height}
              </span>
            )}
          </div>

          {/* Compression Preview */}
          {compressionSettings.enableCompression && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              {isLoadingPreview ? (
                <div className="flex items-center gap-2 text-primary-600 text-sm">
                  <div className="loading-dots">Calculating compression</div>
                </div>
              ) : compressionPreview ? (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Compressed:</span>
                    <span className="font-bold text-gray-800">
                      {formatFileSize(compressionPreview.compressedSize)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 font-medium">Savings:</span>
                    <span className="font-bold text-green-600">
                      -{compressionPreview.savings} ({Math.round(compressionPreview.compressionRatio)}%)
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-xs text-center">
                  Unable to preview compression
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={() => onRemove(image.id)}
        disabled={image.status === 'converting'}
        className={`
          w-9 h-9 rounded-full flex items-center justify-center text-gray-600 transition-all duration-200
          ${image.status === 'converting' 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-red-500 hover:text-white hover:scale-110'
          }
        `}
        aria-label={`Remove ${image.name}`}
      >
        ✕
      </button>
    </div>
  );
};

export const ImageList = ({ images, onRemoveImage, compressionSettings }) => {
  const totalOriginalSize = images.reduce((sum, img) => sum + img.size, 0);

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
        <h3 className="text-lg font-bold text-gray-800">
          Selected Images ({images.length})
        </h3>
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-gray-600 font-medium">
            Total Size: <span className="text-gray-800">{formatFileSize(totalOriginalSize)}</span>
          </span>
          {compressionSettings.enableCompression && (
            <span className="px-3 py-1 bg-green-500 text-white rounded-full font-medium text-xs">
              🗜️ Compression enabled ({Math.round(compressionSettings.quality * 100)}% quality)
            </span>
          )}
        </div>
      </div>

      {/* Image List */}
      <div className="space-y-3">
        {images.map((image) => (
          <ImageItemComponent
            key={image.id}
            image={image}
            onRemove={onRemoveImage}
            compressionSettings={compressionSettings}
          />
        ))}
      </div>
    </div>
  );
};