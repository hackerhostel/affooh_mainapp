import React, {useEffect, useState} from 'react';
import {XCircleIcon} from "@heroicons/react/24/outline/index.js";
import FormSelect from "../FormSelect.jsx";
import {getSelectOptions, getUserSelectOptions} from "../../utils/commonUtils.js";
import axios from "axios";
import {useToasts} from "react-toast-notifications";

const TaskAttriEditPopUp = ({editOptions, setEditOptions, taskAttributes, refetchSprint}) => {
    const {addToast} = useToasts();
    const [dataFieldId, setDataFieldId] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const {dataField} = editOptions

    useEffect(() => {
        if (editOptions?.dataFieldId)
            setDataFieldId(editOptions?.dataFieldId)
    }, [editOptions]);

    const onSelectFilterChange = (value, name) => {
        setDataFieldId(Number(value))
    }

    const closeModal = () => setEditOptions({});

    const updateTaskAttributes = async () => {
        setIsSubmitting(true)
        try {
            let payload = {}

            if (dataField === "assignee") {
                payload = {
                    taskID: editOptions?.id,
                    type: 'TASK',
                    attributeDetails: {
                        attributeKey: 'assigneeID',
                        attributeValue: dataFieldId
                    }
                };
            } else {
                payload = {
                    taskID: editOptions?.id,
                    type: 'TASK_ATTRIBUTE',
                    attributeDetails: {
                        attributeKey: editOptions?.editAttribute?.attributeKey,
                        taskFieldID: editOptions?.editAttribute?.taskFieldID,
                        attributeValue: dataFieldId
                    }
                };
            }

            const response = await axios.put(`/tasks/${editOptions?.id}`, payload)
            const updated = response?.data?.body?.task?.id

            if (updated) {
                addToast(`${editOptions?.caption} successfully updated`, {appearance: 'success'});
                closeModal()
                await refetchSprint()
            } else {
                addToast(`Failed to update ${editOptions?.caption}`, {appearance: 'error'});
            }
        } catch (error) {
            addToast(`Failed to update ${editOptions?.caption}`, {appearance: 'error'});
        }
        setIsSubmitting(false)
    }

    return (
        editOptions?.id && (
            <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="absolute inset-0 bg-gray-500 bg-opacity-50 backdrop-blur-sm" onClick={closeModal}/>
                <div className="relative z-10 w-full max-w-md p-6 bg-white rounded-lg shadow-lg">
                    <XCircleIcon onClick={closeModal}
                                 className={"absolute top-4 right-4 w-7 h-7 text-primary-pink cursor-pointer"}/>
                    <div className="text-center mt-10 flex-col">
                        <p className="text-sm text-text-color mt-2">
                            Editing <b>{editOptions?.caption}</b> of
                        </p>
                        <p className="text-sm text-text-color">
                            <b>{`${editOptions?.title}`}</b> task
                        </p>
                        <p className="text-sm text-text-color mt-2">
                            Current Value: <b>{`${editOptions?.value}`}</b>
                        </p>
                        <div className="mt-4 flex justify-center space-x-4 items-center">
                            <p className="text-sm text-text-color">New Value:</p>
                            {dataField === "status" ? (
                                <div className={"min-w-32"}>
                                    <FormSelect
                                        name="status"
                                        formValues={{status: dataFieldId}}
                                        options={getSelectOptions(taskAttributes?.statuses)}
                                        onChange={({target: {name, value}}) => onSelectFilterChange(value, name)}
                                    />
                                </div>
                            ) : dataField === "assignee" ? (
                                <div className={"min-w-44"}>
                                    <FormSelect
                                        name="assignee"
                                        formValues={{assignee: dataFieldId}}
                                        options={getUserSelectOptions(taskAttributes?.users)}
                                        onChange={({target: {name, value}}) => onSelectFilterChange(value, name)}
                                    />
                                </div>
                            ) : dataField === "priority" ? (
                                <div className={"min-w-28"}>
                                    <FormSelect
                                        name="priority"
                                        formValues={{priority: dataFieldId}}
                                        options={getSelectOptions(taskAttributes?.priorities)}
                                        onChange={({target: {name, value}}) => onSelectFilterChange(value, name)}
                                    />
                                </div>
                            ) : (
                                <></>
                            )}
                        </div>
                        <div className="mt-6 flex justify-center space-x-4">
                            <button type="submit"
                                    className="px-4 py-2 bg-primary-pink text-white rounded hover:bg-pink-600 w-2/4 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    disabled={editOptions?.dataFieldId === dataFieldId || isSubmitting}
                                    onClick={updateTaskAttributes}
                            >
                                Update
                            </button>
                            <button
                                onClick={closeModal}
                                className="px-4 py-2 text-gray-700 rounded w-1/4 border border-black cursor-pointer disabled:cursor-not-allowed"
                                disabled={isSubmitting}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default TaskAttriEditPopUp;
