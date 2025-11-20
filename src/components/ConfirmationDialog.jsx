import React from 'react';
import {TrashIcon, XCircleIcon} from "@heroicons/react/24/outline/index.js";

const ConfirmationDialog = ({
                                isOpen,
                                onClose,
                                onConfirm,
                                title = "Are You Sure?",
                                message,
                            }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-4 relative">
                {/* Icons */}
                <XCircleIcon onClick={onClose}
                             className={"absolute top-4 right-4 w-7 h-7 text-pink-700 hover:text-gray-600"}/>

                <div className="flex justify-center pt-8 pb-6">
                    <div className="w-16 h-16 rounded-full border-2 border-pink-500 flex items-center justify-center">
                        <TrashIcon className={"w-10 h-10 text-pink-700"}/>
                    </div>
                </div>

                {/* Content */}
                <div className="text-center px-6 pb-6">
                    <h4 className="text-2xl font-semibold text-gray-900 mb-4">
                        {title}
                    </h4>
                    <p className="text-gray-600 mb-8">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={onConfirm}
                            className="px-6 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors"
                        >
                            Yes, Delete It
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog;