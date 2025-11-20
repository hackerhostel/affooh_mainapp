import React, {useEffect, useState} from "react";
import axios from "axios";
import {useToasts} from "react-toast-notifications";
import useFetchComments from "../../../hooks/custom-hooks/task/useFetchComments.jsx";
import {getRelativeDate} from "../../../utils/commonUtils.js";
import {PencilSquareIcon, ReceiptRefundIcon, TrashIcon} from "@heroicons/react/24/outline/index.js";
import MentionInput from "../../MentionInput.jsx";
import {useSelector} from "react-redux";
import {selectProjectUserList} from "../../../state/slice/projectUsersSlice.js";
import useFetchFlatTasks from "../../../hooks/custom-hooks/task/useFetchFlatTasks.jsx";
import {selectSelectedProject} from "../../../state/slice/projectSlice.js";
import {useHistory, useParams} from "react-router-dom";

const CommentSection = ({taskId, userDetails, initialComments, reFetchComments}) => {
    const {addToast} = useToasts();
    const history = useHistory();
    const projectUserList = useSelector(selectProjectUserList);
    const selectedProject = useSelector(selectSelectedProject);

    const {data: tasksList} = useFetchFlatTasks(selectedProject?.id)

    const [users, setUsers] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [editing, setEditing] = useState(null);
    const [editedComment, setEditedComment] = useState("");
    const [replying, setReplying] = useState(null);
    const [replyingComment, setReplyingComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (projectUserList.length) {
            setUsers(projectUserList.map(o => ({id: Number(o.id), display: `${o.firstName} ${o.lastName}`})))
        }
    }, [projectUserList]);

    useEffect(() => {
        if (tasksList.length) {
            setTasks(tasksList.map(o => ({id: Number(o?.id), display: o?.name})))
        }
    }, [tasksList]);

    useEffect(() => {
       setComments(initialComments)
    }, [initialComments]);

    const handleAddComment = async (parentId = 0) => {
        setIsSubmitting(true)
        if (parentId === 0 ? newComment.trim() : replyingComment.trim()) {
            try {
                const payload = parentId === 0 ? {comment: newComment} : {comment: replyingComment, parentID: parentId}
                const response = await axios.post(`/tasks/${taskId}/comments`, payload)
                const created = response?.data?.body?.status

                if (created) {
                    setNewComment("");
                    setReplying("")
                    await reFetchComments()
                    addToast('Comment Added', {appearance: 'success'});
                    setIsSubmitting(false)
                } else {
                    addToast('Failed to add the comment', {appearance: 'error'});
                    setIsSubmitting(false)
                }
            } catch (error) {
                addToast('Failed to add the comment', {appearance: 'error'});
                setIsSubmitting(false)
            }
        } else {
            addToast('Comment is required', {appearance: 'warning'});
            setIsSubmitting(false)
        }
    };

    const handleUpdateComment = async (id) => {
        setIsSubmitting(true)
        if (editedComment.trim()) {
            setComments(
                comments.map((comment) =>
                    comment.id === id ? {...comment, text: editedComment} : comment
                )
            );
            try {
                const response = await axios.put(`/tasks/${taskId}/comments/${id}`, {comment: editedComment})
                const updated = response?.status
                if (updated === 200) {
                    setEditing(null);
                    setEditedComment("");
                    await reFetchComments()
                    addToast('Comment Updated', {appearance: 'success'});
                    setIsSubmitting(false)
                } else {
                    addToast('Failed to update the comment', {appearance: 'error'});
                    setIsSubmitting(false)
                }
            } catch (error) {
                addToast('Failed to update the comment', {appearance: 'error'});
                setIsSubmitting(false)
            }
        } else {
            addToast('Comment is required', {appearance: 'warning'});
            setIsSubmitting(false)
        }
    };

    const handleDeleteComment = async (id) => {
        try {
            const response = await axios.delete(`/tasks/${taskId}/comments/${id}`)
            const deleted = response?.status
            if (deleted) {
                await reFetchComments()
                addToast('Comment successfully deleted', {appearance: 'success'});
            } else {
                addToast('Failed to delete the comment', {appearance: 'error'});
            }
        } catch (error) {
            addToast('Failed to delete the comment', {appearance: 'error'});
        }
    };

    const handleEditComment = (id, text) => {
        setEditing(id);
        setEditedComment(text);
    };

    const handleReplyCancel = () => {
        setReplying(null);
        setReplyingComment("");
    };

    const handleTaskCommentClick = (code) => {
        if (code) {
            history.push(`/task/${code}`);
        } else {
            addToast('Task not found', {appearance: 'warning'});
        }
    };

    const handleUserCommentClick = (id) => {
        if (id) {
            history.push(`/profile/${id}`);
        } else {
            addToast('User not found', {appearance: 'warning'});
        }
    };

    const displayComment = (inputString) => {
        const parsePattern = /(@\{\{(\d+)\|\|([^\}]+)\}\})|(#\{\{(\d+)\|\|([^\}]+)\}\})/g;

        const parts = [];
        let lastIndex = 0;

        inputString.replace(parsePattern, (match, mention, mentionId, mentionName, task, taskId, taskDesc, offset) => {
            if (offset > lastIndex) {
                parts.push(inputString.slice(lastIndex, offset));
            }

            if (mention) {
                parts.push(
                    <p className={"cursor-pointer text-task-status-qa-bold"} key={`mention-${mentionId}`}
                       onClick={() => handleUserCommentClick(mentionId)}>
                        @{mentionName}
                    </p>
                );
            } else if (task) {
                const taskCode = tasksList.find((t) => t.id === parseInt(taskId, 10))?.code;
                parts.push(
                    <p className={"cursor-pointer text-task-status-done-bold"} key={`task-${taskId}`}
                       onClick={() => handleTaskCommentClick(taskCode)}>
                        #{taskDesc}
                    </p>
                );
            }

            lastIndex = offset + match.length;
            return match;
        });

        if (lastIndex < inputString.length) {
            parts.push(inputString.slice(lastIndex));
        }

        return <span className={"text-secondary-grey flex flex-wrap gap-1 break-all"}>{parts}</span>;
    }

    return (
        <div className="w-full mt-8 p-6 bg-white rounded-lg flex-col">
            <div className="flex gap-5 items-center">
                <div
                    className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
                    {userDetails.firstName?.[0]}{userDetails.lastName?.[0]}
                </div>
                <div className={"w-10/12"}>
                    <MentionInput placeholder={'Add a comment...'} value={newComment} onchange={setNewComment}
                                  users={users} tasks={tasks}/>
                </div>
                <button disabled={isSubmitting}
                        className="flex items-center justify-center cursor-pointer btn-primary text-center w-20"
                     onClick={() => handleAddComment(0)}>
                    <p>Post</p>
                </button>
            </div>
            <div className={'mt-6'}>
                {comments.map((comment) => (
                    <div key={comment?.id} className="mb-4">
                        {editing === comment?.id ? (
                            <div className={"flex w-full gap-4 items-center"}>
                                <div className={"w-full"}>
                                    <MentionInput value={editedComment} onchange={setEditedComment}
                                                  placeholder={'Add a comment...'} users={users} tasks={tasks}/>
                                </div>
                                <div className={"flex gap-4"}>
                                    <button disabled={isSubmitting}
                                        className="flex items-center justify-center cursor-pointer btn-primary text-center w-20"
                                        onClick={() => handleUpdateComment(comment?.id)}>
                                        <p>Update</p>
                                    </button>
                                    <div
                                        className="flex items-center justify-center cursor-pointer btn-secondary text-center w-20"
                                        onClick={() => setEditing(null)}>
                                        <p>Cancel</p>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={"flex w-full justify-between items-center"}>
                                <div className={"flex"}>
                                    <div
                                        className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
                                        {comment?.createdBy?.firstName[0]}{comment?.createdBy?.lastName[0]}
                                    </div>
                                </div>
                                <div className={"flex flex-col flex-grow mx-5"}>
                                    <div className={"flex gap-2"}>
                                        <p className={"text-secondary-grey font-semibold"}>{`${comment?.createdBy?.firstName} ${comment?.createdBy?.lastName}`}</p>
                                        <p className={"text-secondary-grey text-xs"}>{getRelativeDate(comment?.createdAt)}</p>
                                    </div>
                                    {displayComment(comment?.comment)}
                                </div>

                                <div className="flex space-x-2">
                                    <div onClick={() => setReplying(comment?.id)} className={"cursor-pointer"}>
                                        <ReceiptRefundIcon className={"w-5 h-5 text-green-700"}/>
                                    </div>
                                    <div onClick={() => handleEditComment(comment?.id, comment?.comment)}
                                         className={"cursor-pointer"}>
                                        <PencilSquareIcon className={"w-5 h-5 text-black"}/>
                                    </div>
                                    <div onClick={() => handleDeleteComment(comment?.id)} className={"cursor-pointer"}>
                                        <TrashIcon className={"w-5 h-5 text-pink-700"}/>
                                    </div>
                                </div>
                            </div>
                        )}
                        {comment?.replies?.length > 0 && (
                            <div className="ml-4 mt-2 space-y-2">
                                {comment?.replies?.map((reply, index) => (
                                    <div
                                        key={index}
                                        className="pl-3 border-l-2 border-gray-200"
                                    >
                                        {editing === reply?.id ? (
                                            <div className={"flex w-full gap-4 items-center"}>
                                                <div className={"w-full"}>
                                                    <MentionInput value={editedComment} onchange={setEditedComment}
                                                                  placeholder="Write a reply..." users={users}
                                                                  tasks={tasks}/>
                                                </div>
                                                <div className={"flex gap-4"}>
                                                    <button disabled={isSubmitting}
                                                        className="flex items-center justify-center cursor-pointer btn-primary text-center w-20"
                                                        onClick={() => handleUpdateComment(reply?.id)}>
                                                        <p>Update</p>
                                                    </button>
                                                    <div
                                                        className="flex items-center justify-center cursor-pointer btn-secondary text-center w-20"
                                                        onClick={() => setEditing(null)}>
                                                        <p>Cancel</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className={"flex w-full justify-between items-center"}>
                                                <div className={"flex"}>
                                                    <div
                                                        className="w-9 h-9 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
                                                        {reply?.createdBy?.firstName[0]}{reply?.createdBy?.lastName[0]}
                                                    </div>
                                                </div>
                                                <div className={"flex flex-col flex-grow mx-5"}>
                                                    <div className={"flex gap-2"}>
                                                        <p className={"text-secondary-grey font-semibold"}>{`${reply?.createdBy?.firstName} ${reply?.createdBy?.lastName}`}</p>
                                                        <p className={"text-secondary-grey text-xs"}>{getRelativeDate(reply?.createdAt)}</p>
                                                    </div>
                                                    {displayComment(reply?.comment)}
                                                </div>

                                                <div className="flex space-x-2">
                                                    <div
                                                        onClick={() => handleEditComment(reply?.id, reply?.comment)}
                                                        className={"cursor-pointer"}>
                                                        <PencilSquareIcon className={"w-5 h-5 text-black"}/>
                                                    </div>
                                                    <div onClick={() => handleDeleteComment(reply?.id)}
                                                         className={"cursor-pointer"}>
                                                        <TrashIcon className={"w-5 h-5 text-pink-700"}/>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                        {replying === comment?.id && (
                            <div className="pl-3 border-l-2 border-gray-200 flex gap-4 items-center w-full mt-4 ml-4">
                                <div className={"w-full"}>
                                    <MentionInput value={replyingComment} onchange={setReplyingComment}
                                                  placeholder="Write a reply..." users={users} tasks={tasks}/>
                                </div>
                                <button disabled={isSubmitting}
                                    className="flex items-center justify-center cursor-pointer btn-primary text-center w-20"
                                    onClick={() => handleAddComment(comment?.id)}
                                >
                                    <p>Reply</p>
                                </button>
                                <div
                                    className="flex items-center justify-center cursor-pointer btn-secondary text-center w-20"
                                    onClick={handleReplyCancel}>
                                    <p>Cancel</p>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
