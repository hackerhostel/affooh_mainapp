import React from 'react';

const LoadingPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-xl font-semibold text-gray-700">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingPage;