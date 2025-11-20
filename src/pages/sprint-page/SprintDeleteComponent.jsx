import React from 'react';
import {XMarkIcon} from "@heroicons/react/24/outline/index.js";
import axios from "axios";
import {useToasts} from "react-toast-notifications";

const SprintDeleteComponent = ({onClose, sprint}) => {
    const {addToast} = useToasts();

    const handleClose = (deleted = false) => {
        onClose(deleted)
    };

    const deleteSprint = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.delete(`/sprints/${sprint?.id}`)
            handleClose(true)
            addToast('Sprint Successfully Deleted', {appearance: 'success'});
        } catch (error) {
            addToast('Failed To Delete The Sprint', {appearance: 'error'});
        }
    }

    return (
        <>
            {sprint?.id && (
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-lg h-64 w-full relative">
              <button
                onClick={() => onClose(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
              <p className="text-center text-base mt-6">
                Are you sure you want to delete {sprint.name}?
              </p>

                  <div className="flex justify-center gap-2 mt-16">
                <button
                  onClick={() => onClose(false)}
                  className="px-6 py-2 rounded-md text-gray-600 border border-gray-300 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                    onClick={deleteSprint}
                  className="px-6 py-2 rounded-md bg-primary-pink text-white"
                >
                  Delete
                </button>
              </div>
            </div>
            )}
        </>
    );
};

export default SprintDeleteComponent;
