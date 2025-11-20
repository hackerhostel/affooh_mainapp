import React from 'react';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Delete',
  message = 'Are you sure you want to delete this item?',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <span className="text-lg font-semibold text-gray-800 mb-3">{title}</span>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-primary-pink text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
