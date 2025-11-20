import React, { useEffect, useState } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import { getSelectOptions, getUserOptions } from "../../utils/commonUtils.js";
import { useToasts } from "react-toast-notifications";
import { useDispatch, useSelector } from "react-redux";
import { TestSuiteCreateSchema } from "../../utils/validationSchemas.js";
import useValidation from "../../utils/use-validation.jsx";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import { selectSelectedTestPlan } from "../../state/slice/testPlansSlice.js";
import { selectProjectUserList } from "../../state/slice/projectUsersSlice.js";
import { selectReleaseListForProject } from "../../state/slice/releaseSlice.js";
import { selectTestCaseStatuses } from "../../state/slice/testCaseFormDataSlice.js";
import { doGetPlatforms, selectPlatformList } from "../../state/slice/platformSlice.js";
import FormTextArea from "../../components/FormTextArea.jsx";
import Select from 'react-select';
import { doGetTestCases, selectTestCasesForProject } from "../../state/slice/testCaseSlice.js";
import axios from "axios";
import UserSelect from "../../components/UserSelect.jsx";

const TestSuiteCreateComponent = ({ isOpen, onClose }) => {
    const { addToast } = useToasts();
    const dispatch = useDispatch();

    const selectedProject = useSelector(selectSelectedProject);
    const selectedTestPlan = useSelector(selectSelectedTestPlan);
    const projectUserList = useSelector(selectProjectUserList);
    const testCaseStatuses = useSelector(selectTestCaseStatuses);
    const releases = useSelector(selectReleaseListForProject)
    const platforms = useSelector(selectPlatformList);
    const testCases = useSelector(selectTestCasesForProject)

    useEffect(() => {
        if (selectedProject?.id) {
            dispatch(doGetPlatforms())
            dispatch(doGetTestCases(selectedProject.id))
        }
    }, [selectedProject]);

    useEffect(() => {
        if (!platforms.length) {
            dispatch(doGetPlatforms())
        }
        if (!testCases.length) {
            dispatch(doGetTestCases(selectedProject.id))
        }
    }, [platforms, testCases]);

    const [formValues, setFormValues] = useState({
        summary: '',
        description: '',
        status: 1,
        assignee: '',
        releases: [],
        build: '',
        platforms: [],
        testCases: [],
        projectId: selectedProject.id,
        testPlanId: selectedTestPlan.id
    });

    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors] = useValidation(TestSuiteCreateSchema, formValues);
    const testSuiteStatus = ['Open', 'On Hold', 'Pass', 'Fail'];
    const filterStatus = testCaseStatuses.filter(status => testSuiteStatus.includes(status.value));

    const handleMultiSelect = (selectedOptions, actionMeta) => {
        const { name } = actionMeta;
        if (selectedOptions.length) {
            setFormValues({ ...formValues, [name]: selectedOptions.map(sp => (sp.value)) })
        } else {
            setFormValues({ ...formValues, [name]: [] })
        }
        setIsValidationErrorsShown(false);
    };

    const handleFormChange = (name, value, isText) => {
        setFormValues({ ...formValues, [name]: isText ? value : Number(value) });
        setIsValidationErrorsShown(false);
    };

    const handleClose = (created = false) => {
        onClose(created);
        setFormValues({
            summary: '',
            description: '',
            status: 0,
            assignee: 0,
            releases: [],
            build: '',
            platforms: [],
            testCases: [],
            projectId: selectedProject.id,
            testPlanId: selectedTestPlan.id
        });
        setIsValidationErrorsShown(false);
    };

    const createTestSuite = async (event) => {
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
            if (formErrors?.assignee && formErrors.assignee.length > 0) {
                warningMsg += '\n' + formErrors.assignee[0];
            }

            if (warningMsg.trim() !== '') {
                addToast(warningMsg.trim(), { appearance: 'warning', placement: 'top-right' });
            }
        } else {
            setIsValidationErrorsShown(false);
            try {
                formValues.testPlanId = selectedTestPlan.id
                await axios.post("/test-plans/test-suites", { testSuite: formValues });
                addToast('Test Suite Successfully Created', { appearance: 'success' });
                handleClose(true);
            } catch (error) {
                console.log(error)
                addToast('Failed to create Test Suite', { appearance: 'error' });
            }
        }

        setIsSubmitting(false);
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
                    <div className="bg-white p-5 shadow-lg w-1/2 h-screen overflow-y-auto">
                        <div className="flex justify-between items-center">
                            <p className="font-bold text-2xl">New Test Suite</p>
                            <div className="cursor-pointer" onClick={handleClose}>
                                <XMarkIcon className="w-6 h-6 text-gray-500" />
                            </div>
                        </div>
                        <form className={"flex flex-col justify-between mt-5"} onSubmit={createTestSuite}>
                            <div className="space-y-3">
                                <div className={"flex-col"}>
                                    <p className={"text-secondary-grey"}>Summary</p>
                                    <FormInput
                                        type="text"
                                        name="summary"
                                        formValues={formValues}
                                        onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                        formErrors={formErrors}
                                        showErrors={isValidationErrorsShown}
                                    />
                                </div>
                                <div className={"flex-col"}>
                                    <p className={"text-secondary-grey"}>Description</p>
                                    <FormTextArea
                                        name="description"
                                        formValues={formValues}
                                        onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                        formErrors={formErrors}
                                        showErrors={isValidationErrorsShown}
                                    />
                                </div>
                                <div className={"flex w-full justify-between gap-10"}>
                                    <div className={"flex-col w-2/4"}>
                                        <p className={"text-secondary-grey"}>Build Name</p>
                                        <FormInput
                                            type="text"
                                            name="build"
                                            formValues={formValues}
                                            onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>

                                    <div className={"flex-col w-2/4"}>
                                        <p className={"text-secondary-grey"}>Status</p>
                                        <FormSelect
                                            name="status"
                                            formValues={formValues}
                                            options={filterStatus && filterStatus.length ? getSelectOptions(filterStatus) : []}
                                            onChange={({ target: { name, value } }) => handleFormChange(name, value, false)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>
                                    <div className={"flex-col w-2/4"}>
                                        <UserSelect
                                        label='Assignee'
                                            name="assignee"
                                            value={formValues.assignee}
                                            onChange={({ target: { name, value } }) => {
                                                handleFormChange(name, value, false)
                                            }}
                                            users={projectUserList && projectUserList.length ? getUserOptions(projectUserList) : []}
                                        />
                                    </div>
                                </div>
                                <div className={"flex-col"}>
                                    <p className={"text-secondary-grey mb-2"}>Associated Release(s)</p>
                                    <Select
                                        name="releases"
                                        defaultValue={formValues.releases}
                                        onChange={handleMultiSelect}
                                        options={releases && releases.length ? getSelectOptions(releases) : []}
                                        isMulti
                                        menuPlacement='top'
                                    />
                                </div>
                                <div className={"flex-col"}>
                                    <p className={"text-secondary-grey mb-2"}>Platforms</p>
                                    <Select
                                        name="platforms"
                                        defaultValue={formValues.platforms}
                                        onChange={handleMultiSelect}
                                        options={platforms && platforms.length ? getSelectOptions(platforms) : []}
                                        isMulti
                                        menuPlacement='top'
                                    />
                                </div>
                                <div className={"flex-col"}>
                                    <p className={"text-secondary-grey mb-2"}>Test Cases</p>
                                    <Select
                                        name="testCases"
                                        defaultValue={formValues.testCases}
                                        onChange={handleMultiSelect}
                                        options={platforms && platforms.length ? getSelectOptions(testCases) : []}
                                        isMulti
                                        menuPlacement='top'
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-4 mt-6 self-end w-full">
                                <button
                                    onClick={handleClose}
                                    className="btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={isSubmitting}
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default TestSuiteCreateComponent;
