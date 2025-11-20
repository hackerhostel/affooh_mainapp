import React, { useEffect, useState } from 'react';
import DataGrid, {
  Column,
  ColumnChooser,
  Grouping,
  GroupPanel,
  Paging,
  Scrolling,
  Sorting
} from 'devextreme-react/data-grid';
import './custom-style.css';
import { useHistory } from "react-router-dom";
import {
  addObjectsToArrayByIndex,
  assigneeCellRender,
  columnMap,
  customCellRender,
  customHeaderRender,
  extractNumberFromSquareBrackets,
  getGroupIndex,
  onToolbarPreparing,
  priorityCellRender,
  removeObjectFromArrayByDataField,
  statusCellRender
} from "./utils.jsx";
import FormSelect from "../FormSelect.jsx";
import SearchBar from "../SearchBar.jsx";
import TaskAttriEditPopUp from "../popupForms/taskAttriEditPopUp.jsx";
import { EllipsisVerticalIcon } from '@heroicons/react/24/solid';
import TaskOptionsPopup from '../task/edit/TaskOptionPopup.jsx';

const SprintTable = ({
  taskList,
  typeList,
  filters,
  onSelectFilterChange,
  sprintConfig,
  updateFilterGroups,
  taskAttributes,
  refetchSprint
}) => {
  const history = useHistory();
  const [filteredTaskList, setFilteredTaskList] = useState(taskList);
  const [editOptions, setEditOptions] = useState({});
  const [isOptionOpen, setIsOptionOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });



  useEffect(() => {
    setFilteredTaskList(taskList)
  }, [taskList]);

  const taskTitleComponent = (data) => {
    return <button
      className="px-2 py-1 text-sm hover:bg-gray-50 rounded-lg text-wrap text-start"
      onClick={() => {
        history.push(`/task/${data?.key?.taskCode}`);
      }}
    >
      {data.value}
    </button>
  };

  const handleSearch = (term) => {
    let filtered = taskList;
    if (term.trim() !== '') {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(term.toLowerCase())
      );
    } else {
      setFilteredTaskList(taskList);
    }
    setFilteredTaskList(filtered);
  };

  const onOptionChanged = (e) => {
    const { fullName: funcName, value: index } = e || {};
    const colID = funcName && funcName.includes('groupIndex') || funcName.includes('visibleIndex')
      ? extractNumberFromSquareBrackets(funcName)
      : null;

    if (colID >= 0) {
      const dataField = columnMap.find((col) => col.id === colID)?.dataField;

      if (funcName.includes('groupIndex') && dataField && index >= 0) {
        const updatedGroups = addObjectsToArrayByIndex(sprintConfig, { dataField, index });
        updateFilterGroups(updatedGroups);
      } else if (funcName.includes('visibleIndex') && dataField) {
        const updatedGroups = removeObjectFromArrayByDataField(sprintConfig, dataField);
        updateFilterGroups(updatedGroups);
      }
    }
  };

  const onCellClick = (e) => {
    if (e.column) {
      if (e.column.dataField === "assignee") {
        const assigneeId = e.data.assigneeId;
        setEditOptions({
          dataFieldId: assigneeId,
          id: e.data.id,
          title: e.data.title,
          caption: e.column.caption,
          dataField: e.column.dataField,
          editAttribute: {},
          value: e.data[e.column.dataField]
        })
      } else if (e.column.dataField === "status") {
        const statusId = e.data.statusId;
        setEditOptions({
          dataFieldId: statusId,
          id: e.data.id,
          title: e.data.title,
          caption: e.column.caption,
          dataField: e.column.dataField,
          editAttribute: e.data.statusAttributes,
          value: e.data[e.column.dataField]
        })
      } else if (e.column.dataField === "priority") {
        const priorityId = e.data.priorityId;
        setEditOptions({
          dataFieldId: priorityId,
          id: e.data.id,
          title: e.data.title,
          caption: e.column.caption,
          dataField: e.column.dataField,
          editAttribute: e.data.priorityAttributes,
          value: e.data[e.column.dataField]
        })
      }
    }
  };

  return (
    <div className="px-4">
      <div className="mb-2 mt-1 flex items-center justify-between w-full">
        <div className="flex gap-5 w-1/2 items-center">
          <p className='text-secondary-grey text-lg font-medium'>{`Tasks (${filteredTaskList && filteredTaskList.length})`}</p>
          <div className={"min-w-28"}>
            <FormSelect
              name="type"
              formValues={{ type: filters?.type }}
              options={typeList}
              onChange={({ target: { name, value } }) => onSelectFilterChange(value, name)}
              className="w-28 h-10"
            />
          </div>
          <SearchBar placeholder='Search' onSearch={handleSearch} />
        </div>
      </div>
      <DataGrid
        dataSource={filteredTaskList}
        allowColumnReordering={true}
        showBorders={true}
        width="100%"
        className="shadow-lg rounded-lg overflow-hidden sprint-grid-table h-task-list-screen"
        showRowLines={true}
        showColumnLines={true}
        onToolbarPreparing={onToolbarPreparing}
        onOptionChanged={onOptionChanged}
        onCellClick={onCellClick}
      >
        <ColumnChooser enabled={true} mode="select" />
        <GroupPanel visible />
        <Grouping autoExpandAll />
        <Paging enabled={false} />
        <Scrolling columnRenderingMode="virtual" />
        <Sorting mode="multiple" />
        <Column
          dataField="title"
          caption="Task Name"
          width={350}
          headerCellRender={customHeaderRender}
          cellRender={taskTitleComponent}
          groupIndex={getGroupIndex('title', sprintConfig)}
        />
        <Column
          dataField="assignee"
          caption="Assignee"
          headerCellRender={customHeaderRender}
          cellRender={assigneeCellRender}
          groupIndex={getGroupIndex('assignee', sprintConfig)}
        />
        <Column
          dataField="status"
          caption="Status"
          headerCellRender={customHeaderRender}
          cellRender={statusCellRender}
          width={120}
          groupIndex={getGroupIndex('status', sprintConfig)}
        />
        <Column
          dataField="startDate"
          caption="Start Date"
          dataType="date"
          headerCellRender={customHeaderRender}
          cellRender={customCellRender}
          groupIndex={getGroupIndex('startDate', sprintConfig)}
        />
        <Column
          dataField="endDate"
          caption="End Date"
          dataType="date"
          headerCellRender={customHeaderRender}
          cellRender={customCellRender}
          groupIndex={getGroupIndex('endDate', sprintConfig)}
        />
        <Column
          dataField="epic"
          caption="Epic Name"
          headerCellRender={customHeaderRender}
          cellRender={customCellRender}
          visible={false}
          groupIndex={getGroupIndex('epic', sprintConfig)}
        />
        <Column
          dataField="type"
          caption="Type"
          headerCellRender={customHeaderRender}
          cellRender={customCellRender}
          groupIndex={getGroupIndex('type', sprintConfig)}
        />
        <Column
          dataField="priority"
          caption="Priority"
          headerCellRender={customHeaderRender}
          groupIndex={getGroupIndex('priority', sprintConfig)}
          cellRender={(cellData) => {
            const task = cellData.data;
            return (
              <div className="relative flex justify-between items-center w-full z-50">
                <span className="truncate">{task.priority}</span>

                <EllipsisVerticalIcon
                  className="h-4 w-4 text-gray-600 hover:text-black cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect(); // ← Get icon position
                    setPopupPosition({ top: rect.bottom + 5, left: rect.left }); // Add some spacing
                    setSelectedTask(task);
                    setIsOptionOpen(true);
                  }}
                />
              </div>
            );
          }}
        />
      </DataGrid>

      <div className='-mt-44'>
          {isOptionOpen && selectedTask && (
            <TaskOptionsPopup
              isOpen={true}
              onClose={() => setIsOptionOpen(false)}
              task={selectedTask}
              position={popupPosition}
            />
          )}


        </div>
      <TaskAttriEditPopUp editOptions={editOptions} setEditOptions={setEditOptions} taskAttributes={taskAttributes}
        refetchSprint={refetchSprint} />
    </div>
  );
};

export default SprintTable;