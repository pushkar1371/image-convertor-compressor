import React from 'react';

const INPUT_IMAGE_TYPES = [
  { value: '', label: 'Select image type', icon: '🖼️' },
  { value: 'jpg', label: 'JPEG Image', icon: '🖼️' },
  { value: 'png', label: 'PNG Image', icon: '🖼️' },
];

const OUTPUT_IMAGE_TYPES = [
  { value: '', label: 'Select output format', icon: '📄' },
  { value: 'jpg', label: 'JPEG Image', icon: '🖼️' },
  { value: 'png', label: 'PNG Image', icon: '🖼️' },
  { value: 'pdf', label: 'PDF Document', icon: '📄' },
];

export const ImageTypeSelector = ({
  fromType,
  toType,
  onFromTypeChange,
  onToTypeChange
}) => {
  const isConversionSupported = (from, to) => {
    if (!from || !to || from === to) return false;

    const supportedCombinations = [
      ['jpg', 'png'], ['jpg', 'pdf'],
      ['png', 'jpg'], ['png', 'pdf']
    ];

    return supportedCombinations.some(([f, t]) => f === from && t === to);
  };

  const getConversionMessage = (from, to) => {
    if (!from || !to) return '';
    if (from === to) return 'Source and target formats cannot be the same';
    if (!isConversionSupported(from, to)) return 'This conversion is not supported';

    return '✅ This conversion can be processed in your browser';
  };

  return (
    <div className="mb-8">
      {/* Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
        {/* From Type */}
        <div className="space-y-2">
          <label htmlFor="from-type" className="block text-sm font-semibold text-gray-700">
            From (Source Format)
          </label>
          <select
            id="from-type"
            value={fromType}
            onChange={(e) => onFromTypeChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900 font-medium hover:border-gray-300"
          >
            {INPUT_IMAGE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Arrow */}
        <div className="text-center order-first md:order-none">
          <div className="text-3xl md:text-4xl text-gray-600 transform md:transform-none rotate-90 md:rotate-0">
            →
          </div>
        </div>

        {/* To Type */}
        <div className="space-y-2">
          <label htmlFor="to-type" className="block text-sm font-semibold text-gray-700">
            To (Target Format)
          </label>
          <select
            id="to-type"
            value={toType}
            onChange={(e) => onToTypeChange(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all duration-200 bg-white text-gray-900 font-medium hover:border-gray-300"
          >
            {OUTPUT_IMAGE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.icon} {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Conversion Message */}
      {fromType && toType && (
        <div className="mt-6">
          <div className={`p-4 rounded-xl font-medium ${
            isConversionSupported(fromType, toType) 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {getConversionMessage(fromType, toType)}
          </div>
        </div>
      )}
    </div>
  );
};