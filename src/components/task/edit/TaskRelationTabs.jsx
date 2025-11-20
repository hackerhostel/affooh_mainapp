import React, {useState} from 'react';
import {Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import {PlusCircleIcon} from "@heroicons/react/24/outline/index.js";
import SubTaskSection from "./SubTaskSection.jsx";
import {useSelector} from "react-redux";
import {selectProjectUserList} from "../../../state/slice/projectUsersSlice.js";
import RelationshipSection from "./RealationshipSection.jsx";
import CriteriaSection from "./CriteriaSection.jsx";
import TestCasesSection from "./TestCasesSection.jsx";

const TaskRelationTabs = ({
                              taskId,
                              subTasks,
                              sprintId,
                              refetchTask,
                              projectId,
                              linkedTasks,
                              projectTaskList,
                              acceptedCriteria,
                              testCases
                          }) => {
    const users = useSelector(selectProjectUserList);

    const tabs = [
        {key: 'sub_task', label: 'Sub Task', content: 'Sub Task'},
        {key: 'relationship', label: 'Relationship', content: 'Relationship(s)'},
        {key: 'criteria', label: 'Criteria', content: 'Criteria(s)'},
        {key: 'test_cases', label: 'Test Cases', content: 'Test Cases(s)'},
    ];

    const [selectedTab, setSelectedTab] = useState('sub_task');
    const [addingNew, setAddingNew] = useState(false)

    const handleTabSelect = (key) => {
        setSelectedTab(key)
        setAddingNew(false)
    }

    return (
        <div className="w-full mt-10">
            <TabGroup onChange={(index) => handleTabSelect(tabs[index].key)}>
                <div className={"flex justify-between"}>
                    <div className={"flex"}>
                        <span className="font-semibold text-secondary-grey text-lg mt-1">
                            {tabs.find((tab) => tab.key === selectedTab)?.content}
                        </span>
                        {selectedTab !== "test_cases" && (
                            <div className={"flex gap-1 items-center ml-5 cursor-pointer"}
                                 onClick={() => setAddingNew(true)}>
                                <PlusCircleIcon className={"w-6 h-6 text-pink-500"}/>
                                <span className="font-thin text-xs text-gray-600">Add New</span>
                            </div>
                        )}
                    </div>
                    <TabList className="flex gap-4">
                        {tabs.map((tab) => (
                            <Tab
                                key={tab.key}
                                className={({selected}) =>
                                    `w-18 h-7 rounded-full px-3 text-xs 
                                ${selected ? 'bg-black text-white' : 'bg-white text-secondary-grey'}`
                                }
                            >
                                {tab.label}
                            </Tab>
                        ))}
                    </TabList>
                </div>
                <TabPanels>
                    <TabPanel key={'sub_task'}>
                        <SubTaskSection
                            subtasks={subTasks}
                            addingNew={addingNew}
                            selectedTab={selectedTab}
                            setAddingNew={setAddingNew}
                            users={users}
                            taskId={taskId}
                            sprintId={sprintId}
                            refetchTask={refetchTask}
                            projectId={projectId}
                        />
                    </TabPanel>
                    <TabPanel key={'relationship'}>
                        <RelationshipSection
                            linkedTasks={linkedTasks}
                            addingNew={addingNew}
                            selectedTab={selectedTab}
                            setAddingNew={setAddingNew}
                            users={users}
                            refetchTask={refetchTask}
                            projectId={projectId}
                            projectTaskList={projectTaskList}
                            taskId={taskId}
                        />
                    </TabPanel>
                    <TabPanel key={'criteria'}>
                        <CriteriaSection
                            criterias={acceptedCriteria}
                            addingNew={addingNew}
                            selectedTab={selectedTab}
                            setAddingNew={setAddingNew}
                            refetchTask={refetchTask}
                            taskId={taskId}
                        />
                    </TabPanel>
                    <TabPanel key={'test_cases'}>
                        <TestCasesSection testCases={testCases}/>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default TaskRelationTabs;
