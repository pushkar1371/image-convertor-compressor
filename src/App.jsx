import React, { useState, useCallback } from 'react';
import { ImageUploadZone } from './components/ImageUploadZone';
import { ImageTypeSelector } from './components/ImageTypeSelector';
import { ImageList } from './components/ImageList';
import { ConversionResults } from './components/ConversionResults';
import { CompressionControls } from './components/CompressionControls';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ImageProcessor } from './utils/ImageProcessor';
import './App.css';

function App() {
  const [fromType, setFromType] = useState('');
  const [toType, setToType] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionResults, setConversionResults] = useState([]);
  const [error, setError] = useState('');

  // Compression settings
  const [compressionSettings, setCompressionSettings] = useState({
    quality: 0.8,
    maintainAspectRatio: true,
    enableCompression: false
  });

  const handleImagesSelected = useCallback((files) => {
    const imageItems = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
      status: 'pending'
    }));

    setSelectedImages(prev => [...prev, ...imageItems]);
    setError('');
  }, []);

  const handleRemoveImage = useCallback((id) => {
    setSelectedImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleCompressionSettingsChange = useCallback((settings) => {
    setCompressionSettings(settings);
  }, []);

  const handleConvertImages = useCallback(async () => {
    if (!fromType || !toType || selectedImages.length === 0) {
      setError('Please select image types and add images to convert');
      return;
    }

    setIsConverting(true);
    setError('');

    const processor = new ImageProcessor();
    const results = [];

    try {
      for (const imageItem of selectedImages) {
        // Update image status
        setSelectedImages(prev => 
          prev.map(img => 
            img.id === imageItem.id 
              ? { ...img, status: 'converting' }
              : img
          )
        );

        const result = await processor.convertImage(
          imageItem, 
          fromType, 
          toType,
          compressionSettings
        );

        results.push(result);

        // Update image status
        setSelectedImages(prev => 
          prev.map(img => 
            img.id === imageItem.id 
              ? { ...img, status: result.success ? 'completed' : 'error' }
              : img
          )
        );
      }

      setConversionResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setIsConverting(false);
    }
  }, [fromType, toType, selectedImages, compressionSettings]);

  const canConvert = fromType && toType && selectedImages.length > 0 && !isConverting;
  const showCompressionControls = fromType && toType && (
    (fromType === 'jpg' || fromType === 'png') && 
    (toType === 'jpg' || toType === 'png' || toType === 'pdf')
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1 py-8 px-4 max-w-6xl mx-auto w-full">
        <div className="bg-white rounded-2xl shadow-soft-lg p-6 mb-8">
          <ImageTypeSelector
            fromType={fromType}
            toType={toType}
            onFromTypeChange={setFromType}
            onToTypeChange={setToType}
          />

          {showCompressionControls && (
            <CompressionControls
              settings={compressionSettings}
              onSettingsChange={handleCompressionSettingsChange}
              disabled={isConverting}
            />
          )}

          <ImageUploadZone
            onImagesSelected={handleImagesSelected}
            acceptedTypes={fromType}
            disabled={!fromType}
          />

          {selectedImages.length > 0 && (
            <ImageList
              images={selectedImages}
              onRemoveImage={handleRemoveImage}
              compressionSettings={compressionSettings}
            />
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-center font-medium">
              {error}
            </div>
          )}

          <button
            className={`
              w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-3
              ${canConvert
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
            onClick={handleConvertImages}
            disabled={!canConvert}
          >
            {isConverting ? (
              <>
                <div className="animate-spin text-xl">⟳</div>
                <span>
                  Converting {selectedImages.filter(img => img.status === 'converting').length} of {selectedImages.length}...
                </span>
              </>
            ) : (
              <>
                <span>🔄</span>
                <span>
                  Convert {selectedImages.length} image(s)
                  {compressionSettings.enableCompression ? ' with Compression' : ''}
                </span>
              </>
            )}
          </button>
        </div>

        {conversionResults.length > 0 && (
          <ConversionResults results={conversionResults} />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;