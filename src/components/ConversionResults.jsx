import React from 'react';

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const ConversionResults = ({ results }) => {
  const handleDownload = (result) => {
    const link = document.createElement('a');
    link.href = result.url;
    link.download = result.convertedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadAll = () => {
    const successfulResults = results.filter(r => r.success);
    successfulResults.forEach((result, index) => {
      setTimeout(() => handleDownload(result), index * 100); // Slight delay between downloads
    });
  };

  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);

  // Calculate total compression stats
  const totalStats = successfulResults.reduce((acc, result) => {
    if (result.compressionStats) {
      acc.originalSize += result.compressionStats.originalSize;
      acc.finalSize += result.compressionStats.finalSize;
      acc.fileCount += 1;
    }
    return acc;
  }, { originalSize: 0, finalSize: 0, fileCount: 0 });

  const totalCompressionRatio = totalStats.originalSize > 0 
    ? ((totalStats.originalSize - totalStats.finalSize) / totalStats.originalSize) * 100
    : 0;

  return (
    <div className="bg-white rounded-2xl shadow-soft-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h3 className="text-2xl font-bold text-gray-900">
          Conversion Results
        </h3>
        {successfulResults.length > 1 && (
          <button
            onClick={handleDownloadAll}
            className="px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg"
          >
            📥 Download All ({successfulResults.length})
          </button>
        )}
      </div>

      {/* Compression Summary */}
      {totalStats.fileCount > 0 && totalCompressionRatio > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl p-6 mb-6">
          <h4 className="text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
            📊 Compression Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Original Size:</span>
                <span className="font-bold text-gray-800">{formatFileSize(totalStats.originalSize)}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Final Size:</span>
                <span className="font-bold text-gray-800">{formatFileSize(totalStats.finalSize)}</span>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-300 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-green-700 font-medium">Total Saved:</span>
                <span className="font-bold text-green-600">
                  {formatFileSize(totalStats.originalSize - totalStats.finalSize)} 
                  <span className="block text-sm">({Math.round(totalCompressionRatio)}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Successful Conversions */}
      {successfulResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-bold text-green-600 mb-4 flex items-center gap-2">
            ✅ Successfully Converted ({successfulResults.length})
          </h4>
          <div className="space-y-4">
            {successfulResults.map((result) => (
              <div 
                key={result.id} 
                className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-5 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  {/* File Info */}
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">
                      {result.toType === 'pdf' ? '📄' : '🖼️'}
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-gray-900 mb-2">
                        {result.convertedName}
                      </h5>
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md font-medium">
                          {result.fromType.toUpperCase()} → {result.toType.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-primary-500 text-white rounded-md font-medium">
                          {formatFileSize(result.blob.size)}
                        </span>
                      </div>

                      {/* Compression Stats */}
                      {result.compressionStats && result.compressionStats.compressionRatio > 0 && (
                        <div className="mt-3 space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>🗜️</span>
                            <span>
                              Compressed by <strong>{Math.round(result.compressionStats.compressionRatio)}%</strong> 
                              (saved {formatFileSize(
                                result.compressionStats.originalSize - result.compressionStats.finalSize
                              )})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <span>⚙️</span>
                            <span>Quality: <strong>{Math.round(result.compressionStats.quality * 100)}%</strong></span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={() => handleDownload(result)}
                    className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 shadow-md hover:shadow-lg whitespace-nowrap"
                  >
                    ⬇️ Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Failed Conversions */}
      {failedResults.length > 0 && (
        <div>
          <h4 className="text-lg font-bold text-red-600 mb-4 flex items-center gap-2">
            ❌ Conversion Errors ({failedResults.length})
          </h4>
          <div className="space-y-3">
            {failedResults.map((result) => (
              <div 
                key={result.id} 
                className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900 mb-1">
                      {result.originalName}
                    </h5>
                    <p className="text-red-600 text-sm">
                      {result.error}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};