import React from 'react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-8 px-4 mt-auto">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-4">
          <div className="space-y-2">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              🖼️ Image Formats
            </h4>
            <p className="text-gray-300 text-sm">
              JPG (JPEG) and PNG images supported with intelligent compression
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              🔄 Conversions
            </h4>
            <p className="text-gray-300 text-sm">
              JPG ↔ PNG • Images → PDF • Quality Control
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              🗜️ Compression
            </h4>
            <p className="text-gray-300 text-sm">
              Smart compression with quality presets and size reduction
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold flex items-center gap-2">
              🔒 Privacy First
            </h4>
            <p className="text-gray-300 text-sm">
              All processing happens in your browser - no data leaves your device
            </p>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Built with React 18, JavaScript, Canvas API & jsPDF • Advanced compression algorithms
          </p>
        </div>
      </div>
    </footer>
  );
};