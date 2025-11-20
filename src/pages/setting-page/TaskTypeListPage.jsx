import React, {useEffect, useState} from 'react';
import SearchBar from "../../components/SearchBar.jsx";
import useGraphQL from "../../hooks/useGraphQL.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {Accordion} from "../../components/Accordian.jsx";
import {ChevronRightIcon, TrashIcon} from "@heroicons/react/24/outline/index.js";
import {getTaskTypesByProject} from "../../graphql/setting/TaskTypeQueries/queries.js";

const TaskTypeListPage = ({selectedProject}) => {
    // const dispatch = useDispatch();
    const {makeRequest, loading, error} = useGraphQL();

    const [taskTypes, setTaskTypes] = useState([]);
    const [filteredTaskTypes, setFilteredTaskTypes] = useState([]);

    useEffect(() => {
        const fetchTaskTypes = async () => {
            const query = getTaskTypesByProject;
            const variables = {'projectID': selectedProject?.id};
            const response = await makeRequest(query, variables);

            const taskTypesResponse = response?.data?.listTaskTypesByProject;
            if (taskTypesResponse && Array.isArray(taskTypesResponse)) {
                setTaskTypes(taskTypesResponse)
                setFilteredTaskTypes(taskTypesResponse)
            }
        };

        fetchTaskTypes();
    }, []);

    const handleSearch = (term) => {
        if (term.trim() === '') {
            setFilteredTaskTypes(taskTypes);
        } else {
            const filtered = taskTypes.filter(cf =>
                cf?.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredTaskTypes(filtered);
        }
    };

    if (loading) return <div className="p-2"><SkeletonLoader/></div>;
    if (error) return <ErrorAlert message={error.message}/>;

    return (
        <div className="w-full">
            <div className="flex flex-col gap-3">
                <Accordion name={'Task Types'} addText={'Add New'}>
                    <div className="py-3">
                        <SearchBar onSearch={handleSearch}/>
                    </div>
                    {filteredTaskTypes.map((element, index) => (
                        <button
                            key={index}
                            className="flex justify-between items-center py-3 px-1 my-2 border border-gray-200 rounded-md w-full hover:bg-gray-100 gap-2"
                            // onClick={() => {
                            //     dispatch(setSelectedProjectFromList(index))
                            // }}
                        >
                            <div className="text-left">
                                <div className="font-bold text-black mb-1">{element?.name}</div>
                                <div className="text-xs text-gray-600 flex items-center">
                                    {element?.projects[0]?.name}
                                    <span className="mx-1 text-black text-2xl ">&#8226;</span>
                                    {element?.screen?.name}
                                </div>
                            </div>
                            <div className={"flex gap-1"}>
                                <TrashIcon className={"w-4 h-4 text-pink-700"}/>
                                <ChevronRightIcon className={"w-4 h-4 text-black"}/>
                            </div>
                        </button>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export default TaskTypeListPage;