import jsPDF from 'jspdf';

/**
 * Image processing class for converting and compressing images
 */
export class ImageProcessor {
  constructor() {
    this.supportedConversions = [
      { from: 'jpg', to: 'png', clientSide: true, supportsCompression: true },
      { from: 'jpeg', to: 'png', clientSide: true, supportsCompression: true },
      { from: 'png', to: 'jpg', clientSide: true, supportsCompression: true },
      { from: 'png', to: 'jpeg', clientSide: true, supportsCompression: true },
      { from: 'jpg', to: 'pdf', clientSide: true, supportsCompression: true },
      { from: 'jpeg', to: 'pdf', clientSide: true, supportsCompression: true },
      { from: 'png', to: 'pdf', clientSide: true, supportsCompression: true },
    ];
  }

  /**
   * Convert an image file to another format
   * @param {Object} imageItem - Image item object
   * @param {string} fromType - Source format (jpg, png, pdf)
   * @param {string} toType - Target format (jpg, png, pdf)
   * @param {Object} compressionSettings - Compression settings object
   * @returns {Promise<Object>} Conversion result
   */
  async convertImage(imageItem, fromType, toType, compressionSettings = {}) {
    const normalizedFromType = fromType === 'jpeg' ? 'jpg' : fromType;
    const normalizedToType = toType === 'jpeg' ? 'jpg' : toType;

    const conversion = this.supportedConversions.find(
      c => (c.from === normalizedFromType || (normalizedFromType === 'jpg' && c.from === 'jpeg')) && 
           (c.to === normalizedToType || (normalizedToType === 'jpg' && c.to === 'jpeg'))
    );

    if (!conversion) {
      throw new Error(`Conversion from ${fromType.toUpperCase()} to ${toType.toUpperCase()} is not supported`);
    }

    try {
      let blob;
      let fileName;
      let compressionStats;

      const originalSize = imageItem.file.size;

      if (toType === 'pdf') {
        const result = await this.convertImageToPDF(imageItem.file, compressionSettings);
        blob = result.blob;
        compressionStats = result.stats;
        fileName = imageItem.name.replace(/\.[^/.]+$/, '.pdf');
      } else if (normalizedFromType !== normalizedToType || compressionSettings?.enableCompression) {
        const result = await this.convertImageFormat(imageItem.file, fromType, toType, compressionSettings);
        blob = result.blob;
        compressionStats = result.stats;
        fileName = imageItem.name.replace(/\.[^/.]+$/, `.${toType}`);
      } else {
        throw new Error('No conversion or compression requested');
      }

      const url = URL.createObjectURL(blob);

      return {
        id: imageItem.id,
        originalName: imageItem.name,
        convertedName: fileName,
        blob,
        url,
        fromType,
        toType,
        success: true,
        compressionStats: compressionStats ? {
          originalSize,
          finalSize: blob.size,
          compressionRatio: ((originalSize - blob.size) / originalSize) * 100,
          quality: compressionSettings?.quality || 1.0
        } : undefined
      };
    } catch (error) {
      return {
        id: imageItem.id,
        originalName: imageItem.name,
        convertedName: '',
        blob: new Blob(),
        url: '',
        fromType,
        toType,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Compress an image file
   * @param {File} file - Image file to compress
   * @param {Object} settings - Compression settings
   * @returns {Promise<Object>} Compression result with blob and stats
   */
  async compressImage(file, settings) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate new dimensions if resizing is enabled
          const { width, height } = this.calculateDimensions(
            img.width, 
            img.height, 
            settings.maxWidth, 
            settings.maxHeight, 
            settings.maintainAspectRatio
          );

          canvas.width = width;
          canvas.height = height;

          // Apply white background for JPEG
          const outputFormat = file.type.includes('png') ? 'image/png' : 'image/jpeg';
          if (outputFormat === 'image/jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const stats = {
                  originalSize: file.size,
                  compressedSize: blob.size,
                  compressionRatio: ((file.size - blob.size) / file.size) * 100,
                  quality: settings.quality,
                  originalDimensions: { width: img.width, height: img.height },
                  newDimensions: { width, height }
                };
                resolve({ blob, stats });
              } else {
                reject(new Error('Failed to compress image'));
              }
            },
            outputFormat,
            settings.quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Convert image to PDF
   * @param {File} imageFile - Image file
   * @param {Object} compressionSettings - Compression settings
   * @returns {Promise<Object>} PDF conversion result
   */
  async convertImageToPDF(imageFile, compressionSettings = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = async () => {
        try {
          const pdf = new jsPDF();
          let canvas = document.createElement('canvas');
          let ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Apply compression if enabled
          let processedImage = img;
          let compressionStats = null;

          if (compressionSettings?.enableCompression) {
            const compressedResult = await this.compressImage(imageFile, compressionSettings);

            // Create new image from compressed blob
            const compressedImg = new Image();
            compressedImg.src = URL.createObjectURL(compressedResult.blob);
            await new Promise((resolve) => {
              compressedImg.onload = resolve;
            });

            processedImage = compressedImg;
            compressionStats = compressedResult.stats;
          }

          canvas.width = processedImage.width;
          canvas.height = processedImage.height;
          ctx.drawImage(processedImage, 0, 0);

          // Calculate dimensions to fit PDF page
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgAspectRatio = processedImage.width / processedImage.height;
          const pdfAspectRatio = pdfWidth / pdfHeight;

          let finalWidth, finalHeight;
          if (imgAspectRatio > pdfAspectRatio) {
            finalWidth = pdfWidth - 20; // 10px margin on each side
            finalHeight = finalWidth / imgAspectRatio;
          } else {
            finalHeight = pdfHeight - 20; // 10px margin on each side
            finalWidth = finalHeight * imgAspectRatio;
          }

          const x = (pdfWidth - finalWidth) / 2;
          const y = (pdfHeight - finalHeight) / 2;

          const imgData = canvas.toDataURL('image/jpeg', compressionSettings?.quality || 0.95);
          pdf.addImage(imgData, 'JPEG', x, y, finalWidth, finalHeight);

          const pdfBlob = pdf.output('blob');
          resolve({ 
            blob: pdfBlob, 
            stats: compressionStats || {
              originalSize: imageFile.size,
              compressedSize: pdfBlob.size,
              quality: compressionSettings?.quality || 0.95
            }
          });
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(imageFile);
    });
  }

  /**
   * Convert image format
   * @param {File} file - Image file
   * @param {string} fromType - Source format
   * @param {string} toType - Target format
   * @param {Object} compressionSettings - Compression settings
   * @returns {Promise<Object>} Format conversion result
   */
  async convertImageFormat(file, fromType, toType, compressionSettings = {}) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          // Calculate dimensions with compression settings
          const { width, height } = compressionSettings ? 
            this.calculateDimensions(
              img.width, 
              img.height, 
              compressionSettings.maxWidth, 
              compressionSettings.maxHeight, 
              compressionSettings.maintainAspectRatio
            ) : { width: img.width, height: img.height };

          canvas.width = width;
          canvas.height = height;

          // Fill with white background for JPEG conversion
          if (toType === 'jpg' || toType === 'jpeg') {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(img, 0, 0, width, height);

          const outputFormat = toType === 'png' ? 'image/png' : 'image/jpeg';
          const quality = compressionSettings?.enableCompression ? 
            compressionSettings.quality : 
            (toType === 'png' ? undefined : 0.95);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                const stats = {
                  originalSize: file.size,
                  compressedSize: blob.size,
                  compressionRatio: ((file.size - blob.size) / file.size) * 100,
                  quality: quality || 1.0,
                  originalDimensions: { width: img.width, height: img.height },
                  newDimensions: { width, height }
                };
                resolve({ blob, stats });
              } else {
                reject(new Error('Failed to create blob'));
              }
            },
            outputFormat,
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate optimal dimensions for resizing
   * @param {number} originalWidth - Original image width
   * @param {number} originalHeight - Original image height
   * @param {number} maxWidth - Maximum width
   * @param {number} maxHeight - Maximum height
   * @param {boolean} maintainAspectRatio - Whether to maintain aspect ratio
   * @returns {Object} Calculated dimensions
   */
  calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight, maintainAspectRatio = true) {
    let width = originalWidth;
    let height = originalHeight;

    if (!maxWidth && !maxHeight) {
      return { width, height };
    }

    if (maintainAspectRatio) {
      const aspectRatio = originalWidth / originalHeight;

      if (maxWidth && width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }

      if (maxHeight && height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }
    } else {
      if (maxWidth) width = Math.min(width, maxWidth);
      if (maxHeight) height = Math.min(height, maxHeight);
    }

    return {
      width: Math.round(width),
      height: Math.round(height)
    };
  }

  /**
   * Generate compression preview
   * @param {File} file - Image file
   * @param {number} quality - Compression quality (0.1 to 1.0)
   * @returns {Promise<Object>} Preview result
   */
  async generateCompressionPreview(file, quality) {
    const settings = {
      quality,
      enableCompression: true,
      maintainAspectRatio: true
    };

    const result = await this.compressImage(file, settings);

    return {
      size: result.blob.size,
      compressionRatio: result.stats.compressionRatio,
      blob: result.blob
    };
  }

  /**
   * Generate image thumbnail
   * @param {File} file - Image file
   * @param {number} maxSize - Maximum thumbnail size
   * @returns {Promise<string>} Thumbnail data URL
   */
  async generateThumbnail(file, maxSize = 120) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          const aspectRatio = img.width / img.height;
          const { width, height } = aspectRatio > 1 
            ? { width: maxSize, height: maxSize / aspectRatio }
            : { width: maxSize * aspectRatio, height: maxSize };

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(thumbnailDataUrl);
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }
}