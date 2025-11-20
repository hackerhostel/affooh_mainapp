import React from 'react';
import {Tab, TabGroup, TabList, TabPanel, TabPanels} from "@headlessui/react";
import TimeLogging from "./TimeLogging.jsx";
import CommentSection from "./CommentSection.jsx";
import {useSelector} from "react-redux";
import {selectUser} from "../../../state/slice/authSlice.js";

const CommentAndTimeTabs = ({timeLogs, taskId, refetchTimeLogs, comments, reFetchComments}) => {
    const userDetails = useSelector(selectUser);

    return (
        <div className="w-full mt-10">
            <TabGroup>
                <TabList className="flex gap-4 justify-end rounded-full  text-sm ">
                    <Tab
                        key={'comments'}
                        className="w-28 h-7 rounded-full px-3 text-sm bg-white text-secondary-grey data-[selected]:bg-black data-[selected]:text-white"
                    >
                        Comments
                    </Tab>
                    <Tab
                        key={'timelogs'}
                        className="w-28 h-7 rounded-full  px-3 text-sm bg-white text-secondary-grey data-[selected]:bg-black data-[selected]:text-white"
                    >
                        Time log
                    </Tab>
                </TabList>
                <TabPanels>
                    <TabPanel key={'comments'}>
                        <CommentSection userDetails={userDetails} taskId={taskId} initialComments={comments}
                                        reFetchComments={reFetchComments}/>
                    </TabPanel>
                    <TabPanel key={'timelogs'}>
                        <TimeLogging timeLogs={timeLogs} taskId={taskId} refetchTimeLogs={refetchTimeLogs}
                                     userDetails={userDetails}/>
                    </TabPanel>
                </TabPanels>
            </TabGroup>
        </div>
    );
};

export default CommentAndTimeTabs;
