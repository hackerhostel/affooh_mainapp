import React, {useEffect, useState} from 'react';
import {useToasts} from "react-toast-notifications";
import {useSelector} from "react-redux";
import {TestSuiteCreateSchema} from "../../utils/validationSchemas.js";
import useValidation from "../../utils/use-validation.jsx";
import {selectProjectUserList} from "../../state/slice/projectUsersSlice.js";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormTextArea from "../../components/FormTextArea.jsx";
import {getMultiSelectOptions, getSelectOptions, getUserSelectOptions} from "../../utils/commonUtils.js";
import {PlusCircleIcon} from "@heroicons/react/24/outline/index.js";
import SearchBar from "../../components/SearchBar.jsx";
import useFetchTestSuite from "../../hooks/custom-hooks/test-plan/useFetchTestSuite.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import Select from "react-select";
import axios from "axios";
import TestCaseCreateComponent from "./TestCaseCreateComponent.jsx";
import TestCaseContentComponent from "./TestCaseContentComponent.jsx";

const TestSuiteEditComponent = ({onClose, testSuiteId, testCasesForProject, refetchTestCases}) => {
    const {addToast} = useToasts();

    const projectUserList = useSelector(selectProjectUserList);

    const {loading: testSuiteLoading, data: testSuiteResponse} = useFetchTestSuite(testSuiteId)

    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [platforms, setPlatforms] = useState([]);
    const [releases, setReleases] = useState([]);
    const [testCaseStatuses, setTestCaseStatuses] = useState([]);
    const [testCases, setTestCases] = useState([]);
    const [filteredTestCases, setFilteredTestCases] = useState([]);
    const [formValues, setFormValues] = useState({
        summary: '',
        description: '',
        status: '',
        assignee: '',
        releases: [],
        build: '',
        platforms: [],
        testCases: [],
    });
    const [formErrors] = useValidation(TestSuiteCreateSchema, formValues);
    const [isTestCaseCreateOpen, setIsTestCaseCreateOpen] = useState(false);
    const testSuiteStatus = ['Open', 'On Hold', 'Pass', 'Fail'];
    const filterStatus = testCaseStatuses.filter(status => testSuiteStatus.includes(status.value));

    useEffect(() => {
        if (testSuiteResponse?.testSuite?.id) {
            const testSuiteDetails = testSuiteResponse.testSuite
            const platformOptions = testSuiteResponse?.formData?.platforms.length ? getSelectOptions(testSuiteResponse?.formData?.platforms) : []
            setPlatforms(platformOptions)
            const releaseOptions = testSuiteResponse?.formData?.releases.length ? getSelectOptions(testSuiteResponse?.formData?.releases) : []
            setReleases(releaseOptions)
            setTestCaseStatuses(testSuiteResponse?.formData?.statuses)

            setFormValues({
                ...formValues,
                summary: testSuiteDetails?.summary,
                description: testSuiteDetails?.description,
                status: testSuiteDetails?.status?.id,
                assignee: testSuiteDetails?.assignee?.id,
                build: testSuiteDetails?.testCycles[0]?.build,
                platforms: testSuiteDetails?.platforms.length ? getMultiSelectOptions(platformOptions, testSuiteDetails.platforms.map(p => p.id)) : [],
                releases: testSuiteDetails?.releases?.length ? getMultiSelectOptions(releaseOptions, testSuiteDetails.releases.map(p => p.id)) : [],
                testCases: testSuiteDetails?.testCases?.length ? testSuiteDetails.testCases.map(testCase => testCase.id) : []
            })
        }
    }, [testSuiteResponse]);

    useEffect(() => {
        if (testCasesForProject.length) {
            setTestCases(testCasesForProject)
            setFilteredTestCases(testCasesForProject)
        }
    }, [testCasesForProject]);

    const handleFormChange = (name, value, isText) => {
        setFormValues({...formValues, [name]: isText ? value : value});
        setIsValidationErrorsShown(false);
    };

    const handleMultiSelect = (selectedOptions, actionMeta) => {
        const {name} = actionMeta;
        if (selectedOptions.length) {
            setFormValues({...formValues, [name]: selectedOptions})
        } else {
            setFormValues({...formValues, [name]: []})
        }
        setIsValidationErrorsShown(false);
    };

    const handleClose = (updated = false) => {
        onClose(updated);
        setFormValues({
            summary: '',
            description: '',
            status: 0,
            assignee: 0,
            build: '',
            releases: [],
            platforms: [],
            testCases: [],
        });
        setIsValidationErrorsShown(false);
    };

    const editTestSuite = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (formErrors && Object.keys(formErrors).length > 0) {
            setIsValidationErrorsShown(true);
            let warningMsg = '';

            if (formErrors?.releases && formErrors.releases.length > 0) {
                warningMsg += '\n' + formErrors.releases[0];
            }
            if (formErrors?.platforms && formErrors.platforms.length > 0) {
                warningMsg += '\n' + formErrors.platforms[0];
            }
            if (formErrors?.testCases && formErrors.testCases.length > 0) {
                warningMsg += '\n' + formErrors.testCases[0];
            }

            if (warningMsg.trim() !== '') {
                addToast(warningMsg.trim(), {appearance: 'warning', placement: 'top-right'});
            }
        } else {
            setIsValidationErrorsShown(false);
            const values = {...formValues}
            values.releases = formValues.releases.map(p => p.value)
            values.platforms = formValues.platforms.map(p => p.value)
            delete values.build;

            try {
                await axios.put(`/test-plans/test-suites/${testSuiteId}`, {testSuite: values});
                addToast('Test Suite Successfully Updated', {appearance: 'success'});
                handleClose(true);
            } catch (error) {
                console.log(error)
                addToast('Failed to update the test suite', {appearance: 'error'});
            }
        }
        setIsSubmitting(false);
    }

    const isSelected = (id) => {
        return formValues.testCases.includes(id);
    };

    const handleRowSelection = (id) => {
        let updatedSelectedRows;
        if (formValues.testCases.includes(id)) {
            updatedSelectedRows = formValues.testCases.filter(rowId => rowId !== id);
        } else {
            updatedSelectedRows = [...formValues.testCases, id];
        }
        setFormValues({...formValues, testCases: updatedSelectedRows})
    };

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
        setIsTestCaseCreateOpen(true)
    }

    const handleTestCaseCreateClose = (created) => {
        setIsTestCaseCreateOpen(false);
        if (created === true) {
            refetchTestCases()
        }
    };

    return (
        testSuiteId > 0 ? (
            testSuiteLoading ? (
                <div className="m-10">
                    <SkeletonLoader/>
                </div>
            ) : (
                <>
                    <form className="flex-col" onSubmit={editTestSuite}>
                        <div className="flex-col mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <p className="text-secondary-grey font-bold text-lg">Test Suite Edit</p>
                                <div className="flex space-x-4 mt-6 self-end">
                                    <button
                                        type="submit"
                                        className="px-8 py-2 bg-primary-pink text-white rounded hover:bg-pink-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={isSubmitting}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 border border-black rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        onClick={handleClose}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4 flex-col bg-white p-4 rounded-md">
                                <div className="flex-col">
                                    <p className="text-secondary-grey">Summary</p>
                                    <FormInput
                                        type="text"
                                        name="summary"
                                        formValues={formValues}
                                        onChange={({target: {name, value}}) => handleFormChange(name, value, true)}
                                        formErrors={formErrors}
                                        showErrors={isValidationErrorsShown}
                                    />
                                </div>
                                <div className="flex-col">
                                    <p className="text-secondary-grey">Description</p>
                                    <FormTextArea
                                        name="description"
                                        formValues={formValues}
                                        onChange={({target: {name, value}}) => handleFormChange(name, value, true)}
                                        formErrors={formErrors}
                                        showErrors={isValidationErrorsShown}
                                    />
                                </div>
                                <div className="flex w-full justify-between gap-10">
                                    <div className="flex-col w-1/4">
                                        <p className="text-secondary-grey">Assignee</p>
                                        <FormSelect
                                            name="assignee"
                                            formValues={formValues}
                                            options={getUserSelectOptions(projectUserList)}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, false)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>
                                    <div className="flex-col w-1/4">
                                        <p className="text-secondary-grey">Status</p>
                                        <FormSelect
                                            name="status"
                                            formValues={formValues}
                                            options={getSelectOptions(filterStatus)}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, false)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>
                                    <div className="flex-col w-2/4">
                                        <p className="text-secondary-grey">Build Name</p>
                                        <FormInput
                                            disabled={true}
                                            type="text"
                                            name="build"
                                            formValues={formValues}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, true)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-col mb-8">
                            <div className="flex gap-10 items-center mb-4">
                                <p className="text-secondary-grey font-bold text-lg">Platform</p>
                                <div className="flex gap-1 items-center mr-5 cursor-pointer">
                                    <PlusCircleIcon className="w-6 h-6 text-pink-500"/>
                                    <span className="font-thin text-xs text-gray-600">Add New</span>
                                </div>
                            </div>
                            <div className="py-4 flex-col bg-white p-4 rounded-md">
                                <div className="flex-col">
                                    <p className="text-secondary-grey mb-2">Platforms</p>
                                    <Select
                                        name="platforms"
                                        value={formValues.platforms}
                                        onChange={handleMultiSelect}
                                        options={platforms}
                                        isMulti
                                        menuPlacement='top'
                                    />
                                </div>
                            </div>
                            <div className="py-4 flex-col bg-white p-4 rounded-md">
                                <div className="flex-col">
                                    <p className="text-secondary-grey mb-2">Releases</p>
                                    <Select
                                        name="releases"
                                        value={formValues.releases}
                                        onChange={handleMultiSelect}
                                        options={releases}
                                        isMulti
                                        menuPlacement='top'
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-col mb-8">
                            <div className="flex gap-5 items-center mb-4">
                                <p className="text-secondary-grey font-bold text-lg">Test Cases</p>
                                <div className="flex gap-1 items-center mr-5 cursor-pointer" onClick={onTestCaseAddNew}>
                                    <PlusCircleIcon className="w-6 h-6 text-pink-500"/>
                                    <span className="font-thin text-xs text-gray-600">Add New</span>
                                </div>
                                <SearchBar onSearch={handleTestCaseSearch}/>
                            </div>
                            <div className="py-4 flex-col bg-white p-4 rounded-md">
                                <table className="min-w-full border-collapse border border-gray-300">
                                    <thead>
                                    <tr className="w-full">
                                        <th className="p-2"></th>
                                        <th className="p-2">Summary</th>
                                        <th className="p-2">Priority</th>
                                        <th className="p-2">Type</th>
                                        <th className="p-2">Status</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {filteredTestCases.map(row => (
                                        <tr key={row.id}
                                            className={`${isSelected(row.id) ? 'bg-secondary-pink' : ''} w-full`}>
                                            <td className="border border-gray-300 p-2 text-center">
                                                <input
                                                    className="cursor-pointer mt-2"
                                                    type="checkbox"
                                                    checked={isSelected(row.id)}
                                                    onChange={() => handleRowSelection(row.id)}
                                                />
                                            </td>
                                            <td className="border border-gray-300 p-2 w-3/6">{row.summary}</td>
                                            <td className="border border-gray-300 p-2 w-1/6">
                                            <span
                                                className={`px-2 py-1 rounded`}>
                                                {row.priority.value}
                                            </span>
                                            </td>
                                            <td className="border border-gray-300 p-2 w-1/6">{row.category.value}</td>
                                            <td className="border border-gray-300 p-2 w-1/6">{row.status.value}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </form>
                    <TestCaseCreateComponent isOpen={isTestCaseCreateOpen} onClose={handleTestCaseCreateClose}/>
                </>
            )
        ) : (
            <TestCaseContentComponent testCasesForProject={testCasesForProject} refetchTestCases={refetchTestCases}/>
        )
    );
};

export default TestSuiteEditComponent;
