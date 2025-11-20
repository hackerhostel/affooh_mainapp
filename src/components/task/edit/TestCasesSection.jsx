import React, {useState} from "react";
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/react/24/outline/index.js";
import {priorityCellRender, statusCellRender} from "../../sprint-table/utils.jsx";

const TestCasesSection = ({testCases = []}) => {

    const [currentPage, setCurrentPage] = useState(1);

    const rowsPerPage = 5;
    const totalPages = testCases && testCases.length ? Math.ceil(testCases.length / rowsPerPage) : 0;
    const indexOfLastTask = currentPage * rowsPerPage;
    const indexOfFirstTask = indexOfLastTask - rowsPerPage;
    const currentPageContent = testCases && testCases.length ? testCases.slice(indexOfFirstTask, indexOfLastTask) : [];

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const GenerateRow = ({testCase}) => {
        return (
            <tr className="border-b border-gray-200">
                <td className="py-5 px-4 text-text-color" colSpan={2}>{testCase?.summary}</td>
                <td className="py-5 px-4 text-text-color"></td>
                <td className="py-5 px-4">
                    <div className={'flex justify-center w-full'}>{priorityCellRender(testCase?.priority)}</div>
                </td>
                <td className="px-4 py-4">
                    <div className={'flex justify-center w-full'}>{statusCellRender(testCase?.status)}</div>
                </td>
            </tr>
        );
    };

    return (
        <div className="w-full mt-8 px-6 py-4 bg-white rounded-md shadow-lg">
            {(testCases && testCases.length) ? (
                <>
                    <table className="table-auto w-full border-collapse">
                        <thead>
                        <tr className="text-left text-secondary-grey border-b border-gray-200">
                            <th className="py-5 px-4" colSpan={2}>Name</th>
                            <th className="py-5 px-4"></th>
                            <th className="py-5 px-4 text-center">Priority</th>
                            <th className="py-5 px-4 text-center">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {currentPageContent.map((testCase) => (
                            <GenerateRow testCase={testCase} key={testCase?.testCaseID}/>
                        ))}
                        </tbody>
                    </table>
                    {(testCases && testCases.length > 0) && (
                        <div className="w-full flex gap-5 items-center justify-end mt-4">
                            <button
                                onClick={handlePreviousPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeftIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                            <span className="text-gray-500 text-center">Page {currentPage} of {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                className={`p-2 rounded-full bg-gray-200 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-300"}`}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRightIcon className={"w-4 h-4 text-secondary-grey"}/>
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <p className="text-text-color w-full text-center">No Test Cases Available</p>
            )}
        </div>
    );
};

export default TestCasesSection;
