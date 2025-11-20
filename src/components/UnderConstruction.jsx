import React from 'react';

const UnderConstruction = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md">
        <div className="text-6xl mb-4">🚧</div>
        <span className="text-3xl font-bold text-gray-800 mb-2">Under Construction</span>
        <p className="text-gray-600">
          We're working hard to improve our website. Please check back soon!
        </p>
      </div>
    </div>
  );
};

export default UnderConstruction;