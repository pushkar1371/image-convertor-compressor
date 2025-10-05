import React, { useCallback, useState, useRef } from 'react';

export const ImageUploadZone = ({
  onImagesSelected,
  acceptedTypes,
  disabled = false
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const getAcceptString = useCallback(() => {
    switch (acceptedTypes) {
      case 'jpg':
      case 'jpeg':
        return '.jpg,.jpeg,image/jpeg';
      case 'png':
        return '.png,image/png';
      default:
        return '.jpg,.jpeg,.png,image/jpeg,image/png';
    }
  }, [acceptedTypes]);

  const validateFile = useCallback((file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert(`Image ${file.name} is too large. Maximum size is 10MB.`);
      return false;
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert(`File ${file.name} is not a valid image format. Please select JPG or PNG images.`);
      return false;
    }

    return true;
  }, []);

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(validateFile);

    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }
  }, [disabled, validateFile, onImagesSelected]);

  const handleFileSelect = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(validateFile);

    if (validFiles.length > 0) {
      onImagesSelected(validFiles);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile, onImagesSelected]);

  const handleClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  return (
    <div
      className={`
        border-3 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer mb-8
        ${disabled 
          ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-70' 
          : isDragOver
            ? 'border-primary-500 bg-primary-50 scale-105 shadow-soft-lg'
            : 'border-gray-300 bg-gray-50 hover:border-primary-400 hover:bg-primary-25'
        }
      `}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptString()}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div className="pointer-events-none space-y-4">
        {disabled ? (
          <>
            <div className="text-6xl">⚠️</div>
            <p className="text-lg font-semibold text-gray-600">
              Please select a "From" image type first
            </p>
          </>
        ) : (
          <>
            <div className="text-6xl">🖼️</div>
            <div className="space-y-2">
              <p className="text-lg font-semibold text-gray-800">
                <span className="text-primary-600">Drop images here</span> or{' '}
                <span className="text-primary-600 hover:text-primary-700 transition-colors">
                  click to browse
                </span>
              </p>
              <p className="text-sm text-gray-600">
                Supports JPG and PNG images up to 10MB each
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};