import React from 'react';

export const Header = () => {
  return (
    <header className="gradient-primary text-white py-12 px-4 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center justify-center gap-4">
          <span className="text-5xl md:text-6xl">🖼️</span>
          Image Converter
        </h1>
        <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto mb-6 leading-relaxed">
          Convert JPG, PNG images and create PDFs with smart compression. 
          No uploads required - complete privacy guaranteed.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
            🔄 Format Conversion
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
            🗜️ Smart Compression
          </span>
          <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium border border-white/30">
            🔒 100% Private
          </span>
        </div>
      </div>
    </header>
  );
};