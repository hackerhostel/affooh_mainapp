import React from 'react';
import {Disclosure} from '@headlessui/react';
import {ChevronUpIcon, PlusCircleIcon} from '@heroicons/react/24/outline';

export const Accordion = ({name, addText, children}) => {
    const handlePlusIconClick = (event) => {
        event.stopPropagation();
        console.log('Plus icon clicked');
    };

    return (
        <div className="w-full max-w-md p-1 mx-auto bg-white rounded-2xl">
            <Disclosure>
                {({open}) => (
                    <>
                        <Disclosure.Button
                            className="flex justify-between w-full px-2 py-2 text-sm font-medium text-left text-black rounded-lg focus:outline-none focus-visible:ring focus-visible:ring-purple-500 focus-visible:ring-opacity-75 border items-center">
                            <div className={"flex gap-1 items-center"}>
                                <ChevronUpIcon
                                    className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-black`}/>
                                <span className="font-bold text-base">{name}</span>
                            </div>
                            <div className={"flex gap-1 items-center"} onClick={handlePlusIconClick}>
                                <PlusCircleIcon className={"w-6 h-6 text-pink-500"}/>
                                <span className="font-thin text-xs text-gray-600">{addText}</span>
                            </div>
                        </Disclosure.Button>
                        <Disclosure.Panel className="px-4 pt-4 pb-2 text-sm text-gray-500">
                            {children}
                        </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
        </div>
    );
};