import React from 'react';

const ProgressBar = ({label, progress}) => {
    return (
        <div className="w-full">
            <p className={"text-secondary-grey mb-5"}>{label}</p>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{width: `${progress}%`}}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;
