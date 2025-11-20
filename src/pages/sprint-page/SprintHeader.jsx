import React, { useEffect, useState } from 'react'
import TaskCreateComponent from "../../components/task/create/TaskCreateComponent.jsx";
import timeCalender from '../../assets/Time_Calender.png'
import EditIcon from '../../assets/Edit_Icon.png'
import { formatShortDate } from "../../utils/commonUtils.js";
import ToggleButton from "../../components/ToggleButton.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import DateRangeSelector from "../../components/DateRangeSelector.jsx";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import { doGetSprintBreakdown, setRedirectSprint } from "../../state/slice/sprintSlice.js";

const SprintHeader = ({
  sprint,
  isBacklog = false,
  refetchSprint,
  filters,
  assignees,
  statusList,
  sprintStatusList,
  onSelectFilterChange,
  onToggleFilterChange,
  configChanges,
  sprintConfig,
  setConfigChanges,
  epics,
  isKanban = false
}) => {
  const { addToast } = useToasts();
  const selectedProject = useSelector(selectSelectedProject);
  const dispatch = useDispatch();

  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [dateRangelOpen, setDateRangelOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canClose, setCanClose] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(sprint?.name || '');


  let sprintStatus = sprint?.status?.value || "OPEN"

  useEffect(() => {
    let complete;

    const requiredLabels = ['Done', 'All Status'];
    const filtered = statusList.filter(item => requiredLabels.includes(item.label));

    complete = !!(filtered.length === 2 && requiredLabels.every(label => filtered.some(item => item.label === label)));

    setCanClose((complete && sprintStatus !== "Done") || (!complete && sprintStatus === "Open"));

  }, [statusList]);

  const updateSprint = async (payload, successMessage, errorMessage, pullSprints = false) => {
    setIsSubmitting(true)
    try {
      const response = await axios.put(`/sprints/${sprint?.id}`, { sprint: payload })
      const updated = response?.data?.body

      if (updated) {
        addToast(successMessage, { appearance: 'success' });
        if (pullSprints) {
          dispatch(setRedirectSprint(sprint?.id));
          dispatch(doGetSprintBreakdown(selectedProject?.id))
        }
        await refetchSprint()
      } else {
        addToast(errorMessage, { appearance: 'error' });
      }
    } catch (error) {
      addToast(errorMessage, { appearance: 'error' });
    }

    setIsSubmitting(false)
  }



  const updateDisplayConfig = async () => {
    setIsSubmitting(true)
    try {
      const response = await axios.put(`/sprints/${sprint?.id}/config`, { config: sprintConfig })
      const updated = response?.data?.status

      if (updated) {
        addToast('Sprint display config updated', { appearance: 'success' });
        refetchSprint()
        setConfigChanges(false)
      } else {
        addToast('Failed update the sprint display config', { appearance: 'error' });
      }
    } catch (error) {
      addToast('Failed update the sprint display config', { appearance: 'error' });
    }
    setIsSubmitting(false)
  }

  const closeCreateTaskModal = () => setNewTaskModalOpen(false)
  const closeDateRange = () => setDateRangelOpen(false)

  const updateDateRange = async (dateRange) => {
    closeDateRange()
    await updateSprint({
      sprintID: sprint?.id,
      startDate: moment(dateRange?.startDate).format('YYYY-MM-DD'),
      endDate: moment(dateRange?.endDate).format('YYYY-MM-DD'),
    }, "Sprint Dates Successfully Updated", "Failed To Updated The Sprint Dates")
  }

  const updateSprintStatus = async () => {
    const statusID = (() => {
      const targetValue = sprintStatus === "Open" ? "In Progress" : "Done";
      const status = sprintStatusList?.find(sl => sl.value === targetValue);
      return status?.id;
    })();

    await updateSprint({
      sprintID: sprint?.id,
      statusID: statusID
    }, sprintStatus === "Open" ? "Sprint Started" : "Sprint Completed", sprintStatus === "Open" ? "Failed To Start The Sprint" : "Failed To Complete The Sprint", true)
  }

  // const handleSprintNameSave = async () => {
  //   if (editedName && editedName !== sprint?.name) {
  //     await updateSprint(
  //       { sprintID: sprint?.id, name: editedName },
  //       "Sprint name updated successfully",
  //       "Failed to update sprint name"
  //     );
  //   }
  //   setIsEditingName(false);
  // };


  return (
    <>
      <div className="flex flex-col p-4 gap-4">
        <div><span> <span className='text-popup-screen-header'>Project &gt;</span> <span className='font-semibold'>{selectedProject.name}</span></span></div>
        <div style={{ marginTop: "22px" }} className="flex w-full h-10 bg-white rounded-lg justify-between">
          <div className="flex justify-start items-center">
            <div
              className="flex w-36 text-white text-center bg-primary-pink pl-5 pr-14 rounded-l-lg font-semibold h-10 items-center cursor-pointer"
              onClick={() => setIsEditingName(true)}
            >
              {isEditingName ? (
                <input
                  type="text"
                  className="w-full h-full bg-transparent text-white outline-none"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  // onBlur={handleSprintNameSave}
                  // onKeyDown={(e) => {
                  //   if (e.key === 'Enter') handleSprintNameSave();
                  // }}
                  autoFocus
                />
              ) : (
                <p>{sprint?.name}</p>
              )}
            </div>

            <div className="flex text-status-done font-medium pl-4 pr-5 gap-2">
              <div className={"min-w-1 rounded-md bg-status-done"}></div>
              <p>{sprintStatus}</p></div>
            {!isKanban && !isBacklog && (
              <div className="flex items-center">
                <div className="h-7 w-px bg-gray-500 mr-4"></div>
                <img
                  src={timeCalender}
                  alt="Time Calender"
                  className="max-w-5"
                />
                <p className="ml-3 text-text-color mr-2.5">{formatShortDate(sprint?.startDate)} - {formatShortDate(sprint?.endDate)}</p>
                <img
                  src={EditIcon}
                  alt="Edit Icon"
                  className={`max-w-4 ${isBacklog ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                  onClick={() => {
                    if (!isBacklog) {
                      setDateRangelOpen(true);
                    }
                  }}
                />
              </div>
            )}
          </div>
          <div className="flex justify-end h-12 items-center gap-8 pr-2">
            <ToggleButton label={"Epics"} onChange={e => onToggleFilterChange(e, 'epic')} checked={filters?.epic} />
            <ToggleButton label={"Completed Tasks"} onChange={e => onToggleFilterChange(e, 'completed')}
              checked={filters?.completed} />
            <ToggleButton label={"Sub Tasks"} onChange={e => onToggleFilterChange(e, 'sub')}
              checked={filters?.sub} />
          </div>
        </div>

        <div className="flex w-full h-9 justify-between">
          <div className="flex items-center">
            <div className={"flex-col"}>
              <FormSelect
                name="assignee"
                formValues={{ assignee: filters?.assignee }}
                className="w-40 h-10"
                options={assignees}
                onChange={({ target: { name, value } }) => onSelectFilterChange(value, name)}
              />
            </div>
            <div className={"flex-col ml-3 min-w-32"}>
              <FormSelect
                name="status"
                formValues={{ status: filters?.status }}
                className="w-40 h-10"
                options={statusList}
                onChange={({ target: { name, value } }) => onSelectFilterChange(value, name)}
              />
            </div>
            <div className={"flex-col ml-3 min-w-32"}>
              <FormSelect
                name="epics"
                formValues={{ epics: filters?.epics }}
                className="w-40 h-10"
                options={[{ value: -1, label: 'No Epic' }, ...epics]}
                onChange={({ target: { name, value } }) => onSelectFilterChange(value, name)}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              className="w-24 h-10 text-primary-pink rounded-lg border border-primary-pink cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-300"
              disabled={!configChanges || isSubmitting}
              onClick={updateDisplayConfig}
            >Save
            </button>
            {!isKanban && (
              <button
                className="w-36 h-10 text-primary-pink rounded-lg border border-primary-pink cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-300"
                disabled={isBacklog || sprintStatus === "Done" || isSubmitting || !canClose}
                onClick={updateSprintStatus}
              >
                {sprintStatus === "Open" ? 'Start Sprint' : 'Complete Sprint'}
              </button>
            )}
            <button
              className="w-36 h-10 text-white rounded-lg border border-primary-pink bg-primary-pink cursor-pointer disabled:cursor-not-allowed disabled:text-gray-300 disabled:border-gray-300"
              onClick={() => setNewTaskModalOpen(true)}>
              New Task
            </button>
          </div>
        </div>
      </div>

      <TaskCreateComponent sprintId={sprint?.id} onClose={closeCreateTaskModal} isOpen={newTaskModalOpen}
        refetchSprint={refetchSprint} />
      <DateRangeSelector isOpen={dateRangelOpen} onClose={closeDateRange} startDate={sprint?.startDate}
        endDate={sprint?.endDate} onSave={updateDateRange} />
    </>
  );
}

export default SprintHeader;