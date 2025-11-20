import React, {useEffect, useState} from 'react';
import {CheckIcon, XMarkIcon} from '@heroicons/react/24/solid';
import Spinner from "../../Spinner.jsx";

const FormInputWrapper = ({
                              fieldId,
                              children,
                              isEditing,
                              initialData,
                              currentData,
                              onAccept,
                              onReject,
                              actionButtonPlacement = "side",
                              blockSave = false
                          }) => {
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    if(fieldId) {
      setIsChanged(
          (initialData[fieldId]?.fieldValue[0] || '') !== (currentData[fieldId]?.fieldValue[0] || '')
      );
    } else {
      const childName = React.Children.only(children).props.name;
      setIsChanged(initialData[childName] !== currentData[childName]);
    }
  }, [children, initialData, currentData]);

  return (
      <div className={`${actionButtonPlacement === "side" ? "flex" : "flex-col"} items-center space-x-2`}>
          <div className={"flex flex-grow "}>
              <div className="flex-grow">
                  {children}
              </div>
              {isEditing && isChanged && (
                  <Spinner/>
              )}
          </div>
          {!isEditing && isChanged && (
              <div className="flex space-x-1">
                  <button
                      onClick={onAccept}
                      className="p-1 rounded-full bg-green-500 text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-500"
                      disabled={isEditing || blockSave}
                  >
                      <CheckIcon className="h-5 w-5"/>
                  </button>
                  <button
                      onClick={onReject}
                      className="p-1 rounded-full bg-red-500 text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      disabled={isEditing}
                  >
                      <XMarkIcon className="h-5 w-5"/>
                  </button>
              </div>
          )}
      </div>
  );
};

export default FormInputWrapper;