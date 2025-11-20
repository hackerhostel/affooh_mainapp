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
import { PlusCircleIcon } from '@heroicons/react/24/outline';
import SearchBar from '../../components/SearchBar.jsx';
import TestCaseCreateComponent from './TestCaseCreateComponent.jsx';


const TestCaseContentComponent = ({ testCasesForProject, refetchTestCases }) => {
    const [testCases, setTestCases] = useState([]);
    const [filteredTestCases, setFilteredTestCases] = useState([]);
    const [isTestCaseCreateOpen, setIsTestCaseCreateOpen] = useState(false);

    useEffect(() => {
        setTestCases(testCasesForProject);
        setFilteredTestCases(testCasesForProject);
    }, [testCasesForProject]);

    const handleTestCaseSearch = (term) => {
        if (term.trim() === '') {
            setFilteredTestCases(testCases);
        } else {
            const filtered = testCases.filter(tp =>
                tp?.summary.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredTestCases(filtered);
        }
    };

    const onTestCaseAddNew = () => {
        setIsTestCaseCreateOpen(true);
    };

    const handleTestCaseCreateClose = (created) => {
        setIsTestCaseCreateOpen(false);
        if (created) {
            refetchTestCases();
        }
    };

    return (
        <div className="px-4">
            <div className="mb-2 mt-1 flex items-center justify-between w-full">
                <div className="flex gap-5 w-1/2 items-center">
                    <p className='text-secondary-grey text-lg font-medium'>Test Cases ({filteredTestCases.length})</p>
                    <div className="flex gap-1 items-center cursor-pointer" onClick={onTestCaseAddNew}>
                        <PlusCircleIcon className="w-6 h-6 text-pink-500"/>
                        <span className="font-thin text-xs text-gray-600">Add New</span>
                    </div>
                    <SearchBar onSearch={handleTestCaseSearch}/>
                </div>
            </div>
            <DataGrid
                dataSource={filteredTestCases}
                allowColumnReordering={true}
                showBorders={true}
                width="100%"
                className="shadow-lg rounded-lg overflow-hidden sprint-grid-table"
                showRowLines={true}
                showColumnLines={true}
            >
                <ColumnChooser enabled={true} mode="select"/>
                <GroupPanel disable/>
                <Grouping autoExpandAll/>
                <Paging enabled={true}/>
                <Scrolling columnRenderingMode="virtual"/>
                <Sorting mode="multiple"/>
                <Column dataField="summary" caption="Summary" width={500} />
                <Column dataField="priority.value" caption="Priority" width={200} />
                <Column dataField="category.value" caption="Type" width={200} />
                <Column dataField="status.value" caption="Status" width={200} />
            </DataGrid>
            <TestCaseCreateComponent isOpen={isTestCaseCreateOpen} onClose={handleTestCaseCreateClose} />
        </div>
    );
};

export default TestCaseContentComponent;
