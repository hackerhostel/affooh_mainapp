import AddIcon from '../../assets/add_icon.png'
import {formatDateIfDate, getFirstName, getInitials} from "../../utils/commonUtils.js";
import React from "react";

export const onToolbarPreparing = (e) => {
    const toolbarItems = e.toolbarOptions.items;
    const columnChooserButton = toolbarItems.find((item) => item.name === 'columnChooserButton');

    if (columnChooserButton) {
        columnChooserButton.options.icon = AddIcon;
    }
};

export const customCellRender = (data) => {
    if (typeof data.value === 'object') {
        return <div className="text-sm text-wrap text-start">{formatDateIfDate(data.value)}</div>;
    }
    return <div className="text-sm text-wrap text-start">{data.value}</div>;
};

export const customHeaderRender = (data) => {
    return <div className="font-bold text-gray-600">{data.column.caption}</div>;
};

export const priorityCellRender = (data) => {
    const priority = data?.value || ""

    const bgColors = {
        "Blocker": "bg-status-todo",
        "Critical": "bg-priority-high",
        "Major": "bg-secondary-pink",
        "High": "bg-priority-high",
        "Medium": "bg-priority-medium",
        "Low": "bg-priority-low",
        "Minor": "bg-task-status-uat",
        "Trivial": "bg-task-status-qa",
        "": "bg-secondary-bgc"
    };

    const txtColors = {
        "Blocker": "text-white",
        "Critical": "text-white",
        "Major": "text-secondary-grey",
        "High": "text-white",
        "Medium": "text-secondary-grey",
        "Low": "text-secondary-grey",
        "Minor": "text-secondary-grey",
        "Trivial": "text-black",
        "": "text-black"
    };

    return (
        <div
            className={`${bgColors[priority] || "bg-secondary-bgc"} ${txtColors[priority] || "text-black"} py-1 px-0.5 text-center text-xs rounded-md cursor-pointer w-24`}>
            {priority}
        </div>
    );
}

export const statusCellRender = (data) => {
    const status = data?.value || "To Do"

    const bgColors = {
        "To Do": "bg-task-status-to-do",
        "Open": "bg-task-status-to-do",
        "In Progress": "bg-task-status-in-progress",
        "Done": "bg-task-status-done",
        "Pass": "bg-task-status-done",
        "QA": "bg-task-status-qa",
        "UAT": "bg-task-status-uat",
        "Review Pending": "bg-task-status-uat",
        "Fail": "bg-priority-high",
        "Requires Rework": "bg-task-status-qa",
        "Rejected": "bg-light-red",
        "On Hold": "bg-dashboard-bgc",
        "Closed": "bg-secondary-pink"
    };

    const bgBoldColors = {
        "To Do": "bg-task-status-to-do-bold",
        "Open": "bg-task-status-to-do-bold",
        "In Progress": "bg-task-status-in-progress-bold",
        "Done": "bg-task-status-done-bold",
        "Pass": "bg-task-status-done-bold",
        "QA": "bg-task-status-qa-bold",
        "UAT": "bg-task-status-uat-bold",
        "Review Pending": "bg-task-status-uat-bold",
        "Fail": "bg-status-todo",
        "Requires Rework": "bg-task-status-qa-bold",
        "Rejected": "bg-priority-high",
        "On Hold": "bg-secondary-grey",
        "Closed": "bg-create-button"
    };

    const txtColors = {
        "Fail": "text-white",
        "": "text-secondary-grey"
    };

    return (
        <div
            className={`${bgColors[status] || "bg-secondary-bgc"} ${txtColors[status] || "text-secondary-grey"} py-1 px-2  text-center text-xs rounded-md cursor-pointer flex justify-start gap-2 w-32`}>
            <div className={`${bgBoldColors[status] || "bg-secondary-bgc"} min-w-1 rounded-md`}></div>
            {status === "Done" ? 'Completed' : status}
        </div>
    );
};

export const relationCellRender = (data) => {
    const type = data?.name || "Blocks"

    const bgColors = {
        "Is Blocked By": "bg-light-red",
        "Blocks": "bg-priority-high",
        "Finishes with": "bg-task-status-done",
        "Start with": "bg-task-status-to-do",
        "tbd after": "bg-task-status-uat",
        "tbd before": "bg-task-status-in-progress",
        "Related to": "bg-task-status-qa",
    };

    const bgBoldColors = {
        "Is Blocked By": "bg-priority-high",
        "Blocks": "bg-light-red",
        "Finishes with": "bg-task-status-done-bold",
        "Start with": "bg-task-status-to-do-bold",
        "tbd after": "bg-task-status-uat-bold",
        "tbd before": "bg-task-status-in-progress-bold",
        "Related to": "bg-task-status-qa-bold",
    };

    const fontColors = {
        "Blocks": "text-white",
    };

    return (
        <div
            className={`${bgColors[type] || "bg-secondary-bgc"} ${fontColors[type] || "text-secondary-grey"} py-1 px-2  text-center text-xs rounded-md cursor-pointer flex justify-start gap-2`}>
            <div className={`${bgBoldColors[type] || "bg-secondary-bgc"} min-w-1 rounded-md`}></div>
            {type}
        </div>
    );
};

export const assigneeCellRender = (data) => {
    return <div className="text-sm text-wrap text-start flex items-center gap-1 cursor-pointer">
        <div
            className="w-8 h-8 rounded-full bg-primary-pink flex items-center justify-center text-white text-sm font-semibold">
            {data.value ? (getInitials(data.value)) : "N/A"}
        </div>
        {getFirstName(data.value)}
    </div>;
};

export const columnMap = [
    {id: 0, dataField: 'title'},
    {id: 1, dataField: 'assignee'},
    {id: 2, dataField: 'status'},
    {id: 3, dataField: 'startDate'},
    {id: 4, dataField: 'endDate'},
    {id: 5, dataField: 'epic'},
    {id: 6, dataField: 'type'},
    {id: 7, dataField: 'priority'},
];

export const getGroupIndex = (dataField, configs) => {
    const group = configs.find((obj) => obj.dataField === dataField);
    return group ? group.index : undefined;
};

export const extractNumberFromSquareBrackets = (inputString) => {
    const match = inputString.match(/\[(\d+)\]/);
    return match ? parseInt(match[1], 10) : null;
};

export const addObjectsToArrayByIndex = (arr, paramObj) => {
    return [
        ...arr.map((obj) => ({
            ...obj,
            index: obj.index >= paramObj.index ? obj.index + 1 : obj.index,
        })),
        paramObj,
    ].sort((a, b) => a.index - b.index);
};

export const areObjectArraysEqual = (arr1, arr2) =>
    arr1.length === arr2.length && arr1.every((obj, index) => JSON.stringify(obj) === JSON.stringify(arr2[index]));


export const removeObjectFromArrayByDataField = (arr, dataFieldToRemove) => {
    const newArray = arr.filter((obj) => obj.dataField !== dataFieldToRemove);
    const removedIndex = arr.findIndex((obj) => obj.dataField === dataFieldToRemove);

    if (removedIndex !== -1) {
        return newArray.map((obj) => ({
            ...obj,
            index: obj.index > removedIndex ? obj.index - 1 : obj.index,
        }));
    }

    return newArray;
};



