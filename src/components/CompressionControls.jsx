import React, { useState, useEffect } from 'react';

export const CompressionControls = ({
  settings,
  onSettingsChange,
  disabled = false
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  // Debounced updates to parent
  useEffect(() => {
    const timer = setTimeout(() => {
      onSettingsChange(localSettings);
    }, 300);

    return () => clearTimeout(timer);
  }, [localSettings, onSettingsChange]);

  const handleQualityChange = (quality) => {
    setLocalSettings(prev => ({ ...prev, quality: parseFloat(quality) }));
  };

  const handleDimensionChange = (key, value) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    setLocalSettings(prev => ({ ...prev, [key]: numValue }));
  };

  const handleToggleCompression = () => {
    setLocalSettings(prev => ({ ...prev, enableCompression: !prev.enableCompression }));
  };

  const handleToggleAspectRatio = () => {
    setLocalSettings(prev => ({ ...prev, maintainAspectRatio: !prev.maintainAspectRatio }));
  };

  const getQualityLabel = (quality) => {
    if (quality >= 0.9) return 'High Quality';
    if (quality >= 0.7) return 'Good Quality';
    if (quality >= 0.5) return 'Medium Quality';
    if (quality >= 0.3) return 'Low Quality';
    return 'Very Low Quality';
  };

  const getCompressionEstimate = (quality) => {
    const compressionPercent = Math.round((1 - quality) * 80); // Rough estimate
    return `~${compressionPercent}% smaller`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          🗜️ Compression Settings
        </h3>

        {/* Toggle Switch */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={localSettings.enableCompression}
            onChange={handleToggleCompression}
            disabled={disabled}
            className="sr-only"
          />
          <div className={`toggle-slider ${localSettings.enableCompression ? 'active' : ''} ${disabled ? 'opacity-50' : ''}`}>
          </div>
          <span className="font-semibold text-gray-700">
            {localSettings.enableCompression ? 'Enabled' : 'Disabled'}
          </span>
        </label>
      </div>

      {localSettings.enableCompression && (
        <div className="space-y-6">
          {/* Quality Control */}
          <div className="space-y-3">
            <label htmlFor="quality-slider" className="block text-base font-semibold text-gray-700">
              Quality: {Math.round(localSettings.quality * 100)}%
            </label>
            <div className="space-y-2">
              <input
                id="quality-slider"
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={localSettings.quality}
                onChange={(e) => handleQualityChange(e.target.value)}
                disabled={disabled}
                className={`w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-700">
                  {getQualityLabel(localSettings.quality)}
                </span>
                <span className="text-green-600 font-semibold">
                  {getCompressionEstimate(localSettings.quality)}
                </span>
              </div>
            </div>
          </div>

          {/* Dimension Controls */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">
              Resize Image (optional)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label htmlFor="max-width" className="block text-sm text-gray-600 font-medium">
                  Max Width (px)
                </label>
                <input
                  id="max-width"
                  type="number"
                  placeholder="Original"
                  value={localSettings.maxWidth || ''}
                  onChange={(e) => handleDimensionChange('maxWidth', e.target.value)}
                  disabled={disabled}
                  min="50"
                  max="4000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>

              <div className="flex justify-center items-end pb-2">
                <span className="text-2xl text-gray-400">×</span>
              </div>

              <div className="space-y-2">
                <label htmlFor="max-height" className="block text-sm text-gray-600 font-medium">
                  Max Height (px)
                </label>
                <input
                  id="max-height"
                  type="number"
                  placeholder="Original"
                  value={localSettings.maxHeight || ''}
                  onChange={(e) => handleDimensionChange('maxHeight', e.target.value)}
                  disabled={disabled}
                  min="50"
                  max="4000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mt-2">
              <input
                type="checkbox"
                checked={localSettings.maintainAspectRatio}
                onChange={handleToggleAspectRatio}
                disabled={disabled}
                className="rounded"
              />
              <span>Maintain aspect ratio</span>
            </label>
          </div>

          {/* Quality Presets */}
          <div className="space-y-3">
            <label className="block text-base font-semibold text-gray-700">
              Quick Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { label: 'Original', value: 1.0 },
                { label: 'High', value: 0.8 },
                { label: 'Medium', value: 0.6 },
                { label: 'Small', value: 0.3 }
              ].map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleQualityChange(preset.value)}
                  disabled={disabled}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 transition-all duration-200 ${
                    localSettings.quality === preset.value
                      ? 'bg-primary-500 text-white border-primary-500 shadow-md'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:text-primary-600'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};