import React, {useEffect, useState} from "react";
import {
    CheckBadgeIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    TrashIcon,
    XMarkIcon
} from "@heroicons/react/24/outline/index.js";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import FormInput from "../../FormInput.jsx";
import ToggleButton from "../../ToggleButton.jsx";

const CriteriaSection = ({
                             criterias,
                             addingNew,
                             selectedTab,
                             setAddingNew,
                             taskId,
                             refetchTask,
                         }) => {
    const {addToast} = useToasts();

    const [newRow, setNewRow] = useState({description: '', status: 'Open'});
    const [showNewRow, setShowNewRow] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (addingNew && selectedTab === 'criteria') {
            setShowNewRow(true)
        } else {
            setShowNewRow(false)
        }
    }, [addingNew, selectedTab]);

    const rowsPerPage = 5;
    const totalPages = criterias && criterias.length ? Math.ceil(criterias.length / rowsPerPage) : 0;
    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentPageContent = criterias && criterias.length ? criterias.slice(indexOfFirstTask, indexOfLastTask) : [];

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const onHideNew = () => {
        setAddingNew(false)
        setNewRow({description: '', status: 'Open'})
    }

    const handleFormChange = (isBool, name, value) => {
        setNewRow({...newRow, [name]: isBool ? value?.target?.checked ? 'Accepted' : 'Open' : value});
    };

    const manageCriteria = async (action, payloadData) => {
        setIsSubmitting(true)
        const payload = {
            taskID: taskId,
            toSave: action === 'save' ? [newRow] : [],
            toUpdate: action === 'update' ? [payloadData] : [],
            toDelete: action === 'remove' ? [payloadData] : [],
        }

        try {
            const response = await axios.put(`/tasks/${taskId}/accepted-criteria`, payload)
            const status = response?.status
            if (status === 200) {
                addToast(`Acceptance criteria successfully ${action}d`, {appearance: 'success'});
                refetchTask(true)
                if (action === 'save') {
                    onHideNew()
                }
            } else {
                addToast(`Failed to ${action} acceptance criteria`, {appearance: 'error'});
            }
        } catch (error) {
            addToast(`Failed to ${action} acceptance criteria`, {appearance: 'error'});
        }
        setIsSubmitting(false)
    };

    const GenerateRow = ({criteria}) => {
        const criteriaId = criteria?.acId
        const description = criteria?.description
        const [status, setSatus] = useState(criteria?.status);

        const updateCriteria = (e) => {
            const check = e?.target?.checked ? "Accepted" : "Open";
            if (status !== check) {
                setSatus(check);
                manageCriteria('update', {acId: criteriaId, status: check});
            }
        };

        return (
            <tr className="border-b border-gray-200">
                <td className="py-5 px-4 text-text-color" colSpan="2">{description}</td>
                <td className="py-5 px-4 flex gap-3 items-center text-text-color">
                    <div>
                        <ToggleButton onChange={e => updateCriteria(e)}
                                      checked={status === "Accepted"} disabled={isSubmitting}/>
                    </div>
                </td>
                <td className="px-4 py-5">
                    <div className={"flex gap-5"}>
                        <div className="cursor-pointer" onClick={() => manageCriteria('remove', criteriaId)}>
                            <TrashIcon className={"w-5 h-5 text-red-600 cursor-pointer"}/>
                        </div>
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="w-full mt-8 px-6 py-4 bg-white rounded-md shadow-lg">
            {(criterias && criterias.length) || showNewRow ? (
                <>
                    <table className="table-auto w-full border-collapse">
                        <thead>
                        <tr className="text-left text-secondary-grey border-b border-gray-200">
                            <th className="py-5 px-4">Task Name</th>
                            <th className="py-5 px-4"></th>
                            <th className="py-5 px-4">Status</th>
                            <th className="py-5 px-4">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {showNewRow && (
                            <tr className="border-b border-gray-200">
                                <td className="px-4 py-5" colSpan="2">
                                    <FormInput
                                        type="text"
                                        name="description"
                                        formValues={{description: newRow.description}}
                                        onChange={({target: {name, value}}) => handleFormChange(false, name, value)}
                                    />
                                </td>
                                <td className="px-4 py-5 w-44">
                                    <ToggleButton onChange={e => handleFormChange(true, 'status', e)}
                                                  checked={newRow?.status === "Accepted"} disabled={isSubmitting}/>
                                </td>
                                <td className="px-4 py-5">
                                    <div className={"flex gap-5"}>
                                        <div className={"cursor-pointer"} onClick={() => (manageCriteria('save'))}>
                                            <CheckBadgeIcon className={"w-6 h-6 text-pink-700"}/>
                                        </div>
                                        <div className={"cursor-pointer"} onClick={onHideNew}>
                                            <XMarkIcon className={"w-6 h-6 text-text-color"}/>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {currentPageContent.map((criteria) => (
                            <GenerateRow criteria={criteria} key={criteria?.acId}/>
                        ))}
                        </tbody>
                    </table>
                    {(criterias && criterias.length > 0) && (
                        <div className="w-full flex gap-5 items-center justify-end mt-4">
                            <button
                                onClick={handlePreviousPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                            <span className="text-gray-500 text-center">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRightIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-text-color w-full text-center">No Acceptance Criterias Available</p>
            )}
        </div>
    );
};

export default CriteriaSection;
