import React from 'react';
import 'react-loading-skeleton/dist/skeleton.css';

const ToggleButton = ({label, onChange, checked}) => {
    return (
        <div className="flex items-center mb-1 space-x-2">
            <label htmlFor={label} className="text-secondary-grey mb-0">{label}</label>
            <label htmlFor={label} className="relative cursor-pointer mb-0">
                <input type="checkbox" id={label} onChange={onChange} className="sr-only peer" checked={checked}/>
                <div
                    className="w-10 h-25px bg-white rounded-full border-2 border-secondary-grey transition-colors peer-checked:border-green-500"></div>
                <div style={{marginTop:"-22px"}} className=" w-5 h-5 mb-1 bg-secondary-grey rounded-full shadow top-29.5px translate-x-3px transition-transform
                peer-checked:translate-x-4.2 peer-checked:bg-status-done"></div>
            </label>
        </div>
    )
}
export default ToggleButton;
