import React, {useEffect, useState} from 'react';
import {useSelector} from 'react-redux';
import SprintTable from '../../components/sprint-table/index.jsx';
import {selectSelectedSprint, selectSprintFormData} from '../../state/slice/sprintSlice.js';
import SkeletonLoader from '../../components/SkeletonLoader.jsx';
import ErrorAlert from '../../components/ErrorAlert.jsx';
import SprintHeader from './SprintHeader.jsx';
import useFetchSprint from '../../hooks/custom-hooks/sprint/useFetchSprint.jsx';
import {areObjectArraysEqual} from '../../components/sprint-table/utils.jsx';
import useFetchTaskAttributes from '../../hooks/custom-hooks/sprint/useFetchTaskAttributes.jsx';
import {selectProjectUserList} from '../../state/slice/projectUsersSlice.js';
import {selectSelectedProject} from "../../state/slice/projectSlice.js";

const transformTask = (task) => {
  return {
    id: task.id,
    statusId: task.attributes.status?.id || 1,
    status: task.attributes.status?.value || 'To Do',
    statusAttributes: {
      attributeKey: task.attributes.status?.attributeKey,
      taskFieldID: task.attributes.status?.taskFieldID,
    },
    title: task.name,
    taskCode: task.code,
    assigneeId: task?.assignee?.id ? task?.assignee?.id : 0,
    assignee: task?.assignee?.firstName ? `${task?.assignee?.firstName} ${task?.assignee?.lastName}` : 'Unassigned',
    epicId: task?.epicID || '',
    epic: task?.epicName || '',
    startDate: task.attributes.startDate?.value || null,
    endDate: task.attributes.endDate?.value || null,
    type: task.type,
    priorityId: task.attributes.priority?.id || 0,
    priority: task.attributes.priority?.value || '',
    priorityAttributes: {
      attributeKey: task.attributes.priority?.attributeKey,
      taskFieldID: task.attributes.priority?.taskFieldID,
    },
    parentTaskId: task?.parentTaskID || 0,
  };
};

const SprintContentPage = () => {
  const selectedSprint = useSelector(selectSelectedSprint);
  const sprintStatusList = useSelector(selectSprintFormData);
  const users = useSelector(selectProjectUserList);
  const selectedProject = useSelector(selectSelectedProject);

  const [taskList, setTaskList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [filters, setFilters] = useState({
    epic: false,
    completed: false,
    sub: false,
    assignee: -1,
    status: -1,
    type: -1,
    epics: -1
  });
  const [sprint, setSprint] = useState(null);
  const [sprintId, setSprintId] = useState(0);
  const [isBacklog, setIsBacklog] = useState(false);
  const [assigneeList, setAssigneeList] = useState([]);
  const [statusList, setStatusList] = useState([]);
  const [typeList, setTypeList] = useState([]);
  const [configChanges, setConfigChanges] = useState(false);
  const [sprintConfig, setSprintConfig] = useState([]);
  const [taskAttributes, setTaskAttributes] = useState({});
  const [epics, setEpics] = useState([]);
  const [isKanban, setIsKanban] = useState(false);

  const { error, loading, data: sprintResponse, refetch: refetchSprint } = useFetchSprint(sprintId);
  const { attributeError, attributeLoading, data: attributes } = useFetchTaskAttributes(sprintId);

  useEffect(() => {
    if (sprintResponse?.sprint?.id) {
      setSprint(sprintResponse?.sprint);
      setSprintConfig(sprintResponse?.sprint?.displayConfig || []);
      setIsBacklog(sprintResponse?.sprint?.name === 'BACKLOG');

      const taskListResponse = sprintResponse?.tasks;
      const taskListConverted = [];
      if (taskListResponse && Array.isArray(taskListResponse)) {
        if (taskListResponse.length) {
          const assignees = new Set();
          assignees.add(JSON.stringify({value: -1, label: 'All Assignees'}));
          const status = new Set();
          status.add(JSON.stringify({value: -1, label: 'All Status'}));
          const types = new Set();
          types.add(JSON.stringify({value: -1, label: 'All Types'}));
          let typeCounter = 1;
          const typeIdMap = {};
          const epicList = [];

          taskListResponse.map((task) => {
            const transformedTask = transformTask(task);

            assignees.add(JSON.stringify({value: transformedTask.assigneeId, label: transformedTask.assignee}));
            status.add(JSON.stringify({value: transformedTask.statusId, label: transformedTask.status}));

            if (![...types].some((item) => JSON.parse(item).label === transformedTask.type)) {
              types.add(JSON.stringify({value: typeCounter, label: transformedTask.type}));
              typeIdMap[transformedTask.type] = typeCounter;
              transformedTask['typeId'] = typeCounter++;
            } else {
              transformedTask['typeId'] = typeIdMap[transformedTask.type];
            }

            if (transformedTask.type === 'Epic') {
              epicList.push({value: Number(transformedTask.id), label: transformedTask.title});
            }

            taskListConverted.push(transformedTask);
          });

          setTaskList(taskListConverted);

          setAssigneeList(Array.from(assignees).map((item) => JSON.parse(item)));
          setStatusList(Array.from(status).map((item) => JSON.parse(item)));
          setTypeList(Array.from(types).map((item) => JSON.parse(item)));
          setEpics(epicList);
        } else {
          setTaskList([]);
          setAssigneeList([]);
          setStatusList([]);
          setTypeList([]);
          setEpics([]);
        }
      }
    }
  }, [sprintResponse]);

  useEffect(() => {
    if (attributes !== null) {
      setTaskAttributes({ ...attributes, users: users });
    }
  }, [attributes]);

  useEffect(() => {
    if (selectedSprint?.id) {
      setSprintId(selectedSprint?.id);
    }
  }, [selectedSprint]);

  useEffect(() => {
    if (taskList.length) {
      const epicFilteredTasks = taskList.filter((tl) => filters.epic || tl?.type !== 'Epic');
      const completedFilteredTasks = epicFilteredTasks.filter((tl) => filters.completed || tl?.status !== 'Done');
      const subFilteredTasks = completedFilteredTasks.filter((tl) => filters.sub || tl?.parentTaskId === 0);
      const assigneeFilteredTasks = subFilteredTasks.filter((tl) =>
        filters?.assignee === -1 ? true : tl?.assigneeId === filters.assignee
      );
      const statusFilteredTasks = assigneeFilteredTasks.filter((tl) =>
        filters?.status === -1 ? true : tl?.statusId === filters.status
      );
      const typeFilteredTasks = statusFilteredTasks.filter((tl) =>
        filters?.type === -1 ? true : tl?.typeId === filters.type
      );
      const byEpicFilteredTasks = typeFilteredTasks.filter((tl) =>
          filters?.epics === -1 ? true : tl?.epicId === filters.epics
      );

      setFilteredList(byEpicFilteredTasks);
    } else {
      setFilteredList([])
    }
  }, [taskList, filters]);

  useEffect(() => {
    if (selectedProject?.id) {
      selectedProject?.projectType === 1 ? setIsKanban(false) : setIsKanban(true)
    }
  }, [selectedProject]);

  const onSelectFilterChange = (value, name) => {
    const tempFilters = { ...filters, [name]: Number(value) };
    setFilters(tempFilters);
  };

  const onToggleFilterChange = (e, name) => {
    const tempFilters = { ...filters, [name]: e?.target?.checked };
    setFilters(tempFilters);
  };

  const updateFilterGroups = (newGroups) => {
    setConfigChanges(!areObjectArraysEqual(sprint?.displayConfig, newGroups));
    setSprintConfig(newGroups);
  };

  if (loading || attributeLoading) {
    return (
      <div className="px-2 pt-4 h-content-screen bg-slate-300">
        <SkeletonLoader bars={6} />
      </div>
    );
  }
  if (error || attributeError) return <ErrorAlert message={error.message} />;

  return (
    <div className="bg-slate-100 max-h-[calc(100vh-275px)]">
      <SprintHeader
        sprint={sprint}
        isBacklog={isBacklog}
        refetchSprint={refetchSprint}
        filters={filters}
        onFilterChange={setFilters}
        assignees={assigneeList}
        statusList={statusList}
        sprintStatusList={sprintStatusList}
        onSelectFilterChange={onSelectFilterChange}
        onToggleFilterChange={onToggleFilterChange}
        configChanges={configChanges}
        setConfigChanges={setConfigChanges}
        sprintConfig={sprintConfig}
        epics={epics}
        isKanban={isKanban}
      />
      <SprintTable
        className=""
        taskList={filteredList}
        typeList={typeList}
        filters={filters}
        onSelectFilterChange={onSelectFilterChange}
        sprintConfig={sprintConfig}
        setConfigChanges={setConfigChanges}
        updateFilterGroups={updateFilterGroups}
        taskAttributes={taskAttributes}
        refetchSprint={refetchSprint}
      />
    </div>
  );
};

export default SprintContentPage;
