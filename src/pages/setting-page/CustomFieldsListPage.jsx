import React, {useEffect, useState} from 'react';
import SearchBar from "../../components/SearchBar.jsx";
import useGraphQL from "../../hooks/useGraphQL.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {getAllCustomFields} from "../../graphql/setting/CustomFieldQueries/queries.js";
import {Accordion} from "../../components/Accordian.jsx";
import {ChevronRightIcon, TrashIcon} from "@heroicons/react/24/outline/index.js";

const CustomFieldsListPage = () => {
    // const dispatch = useDispatch();
    const {makeRequest, loading, error} = useGraphQL();

    const [customFields, setCustomFields] = useState([]);
    const [filteredCustomFields, setFilteredCustomFields] = useState([]);

    useEffect(() => {
        const fetchCustomFields = async () => {
            const query = getAllCustomFields;
            const variables = {'excludeGeneralFields': false};
            const response = await makeRequest(query, variables);

            const customFieldsResponse = response.data.getCustomFieldsForOrganization;
            if (customFieldsResponse && Array.isArray(customFieldsResponse)) {
                setCustomFields(customFieldsResponse)
                setFilteredCustomFields(customFieldsResponse)
            }
        };

        fetchCustomFields();
    }, []);

    const handleSearch = (term) => {
        if (term.trim() === '') {
            setFilteredCustomFields(customFields);
        } else {
            const filtered = customFields.filter(cf =>
                cf?.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredCustomFields(filtered);
        }
    };

    if (loading) return <div className="p-2"><SkeletonLoader/></div>;
    if (error) return <ErrorAlert message={error.message}/>;

    return (
        <div className="w-full">
            <div className="flex flex-col gap-3">
                <Accordion name={'Custom Fields'} addText={'Add New'}>
                    <div className="py-3">
                        <SearchBar onSearch={handleSearch}/>
                    </div>
                    {filteredCustomFields.map((element, index) => (
                        <button
                            key={index}
                            className="flex justify-between items-center p-3 my-2 border border-gray-200 rounded-md w-full gap-2 hover:bg-gray-100"
                            // onClick={() => {
                            //     dispatch(setSelectedProjectFromList(index))
                            // }}
                        >
                            <div className="text-left">
                                <div className="font-bold text-black mb-1">{element?.name}</div>
                                <div className="text-xs text-gray-600">{element?.fieldType?.name}</div>
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

export default CustomFieldsListPage;