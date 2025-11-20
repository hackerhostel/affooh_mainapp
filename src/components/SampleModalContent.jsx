import React, { useState } from 'react';

const SampleModalContent = () => {
  const [contentSize, setContentSize] = useState('medium');

  const contentStyles = {
    small: 'w-48',
    medium: 'w-80',
    large: 'w-120'
  };

  return (
    <div className="space-y-4">
      <div className="flex space-x-2 justify-center">
        <button
          onClick={() => setContentSize('small')}
          className={`px-4 py-2 rounded ${contentSize === 'small' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Small
        </button>
        <button
          onClick={() => setContentSize('medium')}
          className={`px-4 py-2 rounded ${contentSize === 'medium' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Medium
        </button>
        <button
          onClick={() => setContentSize('large')}
          className={`px-4 py-2 rounded ${contentSize === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Large
        </button>
      </div>
      <div className={`${contentStyles[contentSize]} mx-auto bg-gray-100 p-4 rounded`}>
        <h4 className="text-lg font-semibold mb-2">Sample Content</h4>
        <p className="mb-2">This is some sample content to demonstrate the Modal's adaptive width.</p>
        <p>Current size: {contentSize}</p>
      </div>
      <div className="text-center text-sm text-gray-500">
        Try clicking the buttons above to change the content size and see how the Modal adapts.
      </div>
    </div>
  );
};

export default SampleModalContent;