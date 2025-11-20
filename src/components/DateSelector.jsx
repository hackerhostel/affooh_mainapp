import React, {useEffect, useState} from 'react';
import {Calendar} from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import {XMarkIcon} from "@heroicons/react/24/outline";

const DateSelector = ({isOpen, onClose, onSave, date}) => {
    const [selectionDate, setSelectionDate] = useState(new Date());

    useEffect(() => {
        if (date) {
            setSelectionDate(date);
        }
    }, [date]);

    const handleSelect = (newDate) => {
        setSelectionDate(newDate);
    };

    const handleClose = () => {
        if (date) {
            setSelectionDate(new Date(date));
        } else {
            setSelectionDate(new Date());
        }
        onClose(true);
    };

    const save = () => {
        onSave(selectionDate);
        onClose(false);
    };

    return isOpen && (
        <div
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
            <div className="p-4 bg-white shadow rounded-lg flex flex-col items-center">
                <div className="flex cursor-pointer w-full justify-end mb-3" onClick={handleClose}>
                    <XMarkIcon className="w-6 h-6 text-gray-500"/>
                </div>
                <Calendar
                    date={selectionDate}
                    onChange={handleSelect}
                />
                <div className="flex cursor-pointer w-full justify-end">
                    <button
                        className="px-4 py-2 bg-primary-pink text-white rounded hover:bg-pink-600 w-full cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                        onClick={save}
                    >
                        Select
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DateSelector;
