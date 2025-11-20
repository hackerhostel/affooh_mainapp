import React from "react";
import ConfirmationDialog from "../../../ConfirmationDialog.jsx";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import {useHistory} from "react-router-dom";

const TaskDelete = ({id, name, sprintId, isOpen, onClose}) => {
    const {addToast} = useToasts();
    const history = useHistory();

    const handleDeleteConfirm = async () => {
        try {
            const response = await axios.delete(`/tasks/${id}`)
            const deleted = response?.data?.status

            if (deleted) {
                addToast('Task Successfully Deleted', {appearance: 'success'});
                onClose()
                history.push(`/sprints/${sprintId}`);
            } else {
                addToast('Failed To Deleted The Task', {appearance: 'error'});
            }
        } catch (error) {
            addToast('Failed To Deleted The Task', {appearance: 'error'});
        }
    };

    return (
        <ConfirmationDialog isOpen={isOpen} message={`Delete task - ${name} ?`} onClose={onClose}
                            onConfirm={handleDeleteConfirm}/>
    );
};

export default TaskDelete;
