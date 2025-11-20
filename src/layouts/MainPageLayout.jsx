import {
  ChevronLeftIcon,
  ChevronDoubleRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline/index.js";
import React, { useState } from "react";

const MainPageLayout = ({
  title,
  leftColumn,
  rightColumn,
  subText,
  onAction,
}) => {
  const [isLeftColumnVisible, setIsLeftColumnVisible] = useState(true);

  const hideLeftColumn = () => setIsLeftColumnVisible(false);
  const showLeftColumn = () => setIsLeftColumnVisible(true);

  return (
    <div className="grid grid-cols-5 h-full relative">
      {isLeftColumnVisible && (
        <div className="col-span-1 relative">
          <div className="pl-4 mt-5 mb-10 flex justify-between">
            <span className="text-2xl mt-2 font-medium">{title}</span>
            {subText && (
              <div
                className={"flex gap-1 items-center mr-5"}
                onClick={onAction}
              >
                <PlusCircleIcon className={"w-6 h-6 text-pink-500 cursor-pointer"} />
                <span className="font-thin text-xs text-gray-600">{subText}</span>
              </div>
            )}
          </div>
          <div className={"flex"}>{leftColumn}</div>
          <div
            className="absolute top-1/2 right-0 transform -translate-y-1/2 flex items-center justify-center mt-12 h-10 bg-white rounded-full shadow cursor-pointer"
            onClick={hideLeftColumn}
          >
            <ChevronLeftIcon className={"w-4 h-4 text-pink-500"} />
          </div>
        </div>
      )}
      <div className={isLeftColumnVisible ? "col-span-4" : "col-span-5"}>
        <div className={"w-full h-full flex-grow flex"}>
          {!isLeftColumnVisible && (
            <div
              className={"flex gap-1 items-center ml-2 mr-2"}
              onClick={showLeftColumn}
            >
              <ChevronDoubleRightIcon
                className={"w-4 h-4 text-pink-500 cursor-pointer"}
              />
            </div>
          )}
          <div className={"w-full h-full flex-grow"}>{rightColumn}</div>
        </div>
      </div>
    </div>
  );
};

export default MainPageLayout;
