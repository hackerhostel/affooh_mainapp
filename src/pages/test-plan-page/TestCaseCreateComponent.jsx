import React, { useState } from 'react';
import { XMarkIcon } from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import { getSelectOptions } from "../../utils/commonUtils.js";
import { useToasts } from "react-toast-notifications";
import { useSelector } from "react-redux";
import { TestCaseCreateSchema } from "../../utils/validationSchemas.js";
import useValidation from "../../utils/use-validation.jsx";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import {
    selectTestCaseCategories,
    selectTestCasePriorities,
    selectTestCaseStatuses
} from "../../state/slice/testCaseFormDataSlice.js";
import FormTextArea from "../../components/FormTextArea.jsx";
import Select from 'react-select';
import useFetchFlatTasks from "../../hooks/custom-hooks/task/useFetchFlatTasks.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import { PlusCircleIcon } from "@heroicons/react/24/outline/index.js";
import axios from "axios";

const TestCaseCreateComponent = ({ isOpen, onClose }) => {
    const { addToast } = useToasts();

    const selectedProject = useSelector(selectSelectedProject);
    const testCaseStatuses = useSelector(selectTestCaseStatuses);
    const testCasePriorities = useSelector(selectTestCasePriorities);
    const testCaseCategories = useSelector(selectTestCaseCategories);

    const { loading, data: tasks } = useFetchFlatTasks(selectedProject?.id)

    const [formValues, setFormValues] = useState({
        summary: '',
        description: '',
        projectId: selectedProject.id,
        priority: '',
        category: '',
        estimate: '',
        steps: [],
        requirements: []
    });

    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors] = useValidation(TestCaseCreateSchema, formValues);

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
            projectId: selectedProject.id,
            priority: '',
            category: '',
            estimate: '',
            steps: [],
            requirements: []
        });
        setIsValidationErrorsShown(false);
    };

    const createTestCase = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);

        if (formErrors && Object.keys(formErrors).length > 0) {
            setIsValidationErrorsShown(true);
            let warningMsg = '';

            if (formErrors?.requirements && formErrors.requirements.length > 0) {
                warningMsg += '\n' + formErrors.requirements[0];
            }
            if (formErrors?.steps && formErrors.steps.length > 0) {
                warningMsg += '\n' + formErrors.steps[0];
            }

            if (warningMsg.trim() !== '') {
                addToast(warningMsg.trim(), { appearance: 'warning' });
            }
        } else {
            formValues["status"] = testCaseStatuses.filter(ts => ts.value === 'Open')[0]?.id || 1
            setIsValidationErrorsShown(false);
            try {
                await axios.post("/test-plans/test-cases", { testCase: formValues });
                addToast('Test Case Successfully Created', { appearance: 'success' });
                handleClose(true);
            } catch (error) {
                console.log(error)
                addToast('Failed to create Test Case', { appearance: 'error' });
            }
        }

        setIsSubmitting(false);
    };

    const addStep = () => {
        setIsValidationErrorsShown(false);
        setFormValues({
            ...formValues,
            steps: [...formValues.steps, {
                id: formValues.steps.length + 1,
                description: '',
                inputData: '',
                expectedOutcome: ''
            }]
        });
    };

    const handleTableInputChange = (id, field, value) => {
        setIsValidationErrorsShown(false);
        const updatedSteps = formValues.steps.map(step =>
            step.id === id ? { ...step, [field]: value } : step
        );
        setFormValues({
            ...formValues,
            steps: updatedSteps
        });
    };

    const removeStep = (id) => {
        setFormValues({
            ...formValues,
            steps: formValues.steps.filter(step => step.id !== id)
        });
    };

    return (
        <>
            {isOpen && (
                <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
                    <div className="bg-white p-5 shadow-lg w-1/2 h-screen overflow-y-auto">
                        {loading ? (
                            <div className="m-10"><SkeletonLoader /></div>
                        ) : (
                            <>
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-2xl">New Test Case</p>
                                    <div className="cursor-pointer" onClick={handleClose}>
                                        <XMarkIcon className="w-6 h-6 text-gray-500" />
                                    </div>
                                </div>
                                <form className={"flex flex-col justify-between mt-5"} onSubmit={createTestCase}>
                                    <div className="space-y-3">
                                        <div className={"flex-col"}>
                                            <p className={"text-secondary-grey"}>Summary</p>
                                            <FormTextArea
                                                name="summary"
                                                formValues={formValues}
                                                onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                                formErrors={formErrors}
                                                showErrors={isValidationErrorsShown}
                                                rows={4}
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
                                                rows={4}
                                            />
                                        </div>
                                        <div className={"flex w-full justify-between gap-10"}>
                                            <div className={"flex-col w-2/4"}>
                                                <p className={"text-secondary-grey"}>Priority</p>
                                                <FormSelect
                                                    name="priority"
                                                    formValues={formValues}
                                                    options={testCasePriorities && testCasePriorities.length ? getSelectOptions(testCasePriorities) : []}
                                                    onChange={({ target: { name, value } }) => handleFormChange(name, value, false)}
                                                    formErrors={formErrors}
                                                    showErrors={isValidationErrorsShown}
                                                />
                                            </div>
                                            <div className={"flex-col w-2/4"}>
                                                <p className={"text-secondary-grey"}>Category</p>
                                                <FormSelect
                                                    name="category"
                                                    formValues={formValues}
                                                    options={testCaseCategories && testCaseCategories.length ? getSelectOptions(testCaseCategories) : []}
                                                    onChange={({ target: { name, value } }) => handleFormChange(name, value, false)}
                                                    formErrors={formErrors}
                                                    showErrors={isValidationErrorsShown}
                                                />
                                            </div>
                                            <div className={"flex-col w-2/4"}>
                                                <p className={"text-secondary-grey"}>Estimate</p>
                                                <FormInput
                                                    type="text"
                                                    name="estimate"
                                                    formValues={formValues}
                                                    onChange={({ target: { name, value } }) => handleFormChange(name, value, true)}
                                                    formErrors={formErrors}
                                                    showErrors={isValidationErrorsShown}
                                                />
                                            </div>
                                        </div>
                                        <div className={"flex-col"}>
                                            <p className={"text-secondary-grey mb-2"}>Requirements</p>
                                            <Select
                                                name="requirements"
                                                defaultValue={formValues.requirements}
                                                onChange={handleMultiSelect}
                                                options={tasks && tasks.length ? getSelectOptions(tasks) : []}
                                                isMulti
                                                menuPlacement='top'
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={true}
                                                allowSelectAll
                                                isSearchable={true}
                                            />
                                        </div>
                                        <div className={"flex-col"}>
                                            <div className={"flex gap-8 mt-7 mb-3"}>
                                                <p className={"text-secondary-grey font-bold text-lg"}>Test Steps</p>
                                                <div className={"flex gap-1 items-center mr-5 cursor-pointer"}
                                                    onClick={addStep}>
                                                    <PlusCircleIcon className={"w-6 h-6 text-pink-500"} />
                                                    <span className="font-thin text-xs text-gray-600">Add New</span>
                                                </div>
                                            </div>
                                            <table
                                                className="min-w-full bg-white shadow-md overflow-hidden border-t border">
                                                <thead>
                                                    <tr>
                                                        <th className="text-left p-4">Description</th>
                                                        <th className="text-left p-4">Input Data</th>
                                                        <th className="text-left p-4">Expected Outcome</th>
                                                        <th className="text-left p-4">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {
                                                        formValues.steps.length === 0 ? (
                                                            <tr>
                                                                <td colSpan="4"
                                                                    className="border-t text-center py-4 text-gray-400 h-100">
                                                                    No Rows
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            formValues.steps.map((step, index) => (
                                                                <tr key={step.id} className="border-t">
                                                                    <td className="p-4 w-56">
                                                                        <FormTextArea
                                                                            name="description"
                                                                            value={step.description}
                                                                            onChange={({ target: { name, value } }) => handleTableInputChange(step.id, name, value)}
                                                                            formErrors={formErrors}
                                                                            showErrors={isValidationErrorsShown}
                                                                            rows={4}
                                                                            className="border h-20 border-gray-300 rounded w-full p-2"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <FormTextArea
                                                                            name="inputData"
                                                                            value={step.inputData}
                                                                            onChange={({ target: { name, value } }) => handleTableInputChange(step.id, name, value)}
                                                                            formErrors={formErrors}
                                                                            showErrors={isValidationErrorsShown}
                                                                            rows={4}
                                                                            className="border h-20 border-gray-300 rounded w-full p-2"
                                                                        />
                                                                    </td>
                                                                    <td className="p-4">
                                                                        <FormTextArea
                                                                            name="expectedOutcome"
                                                                            value={step.expectedOutcome}
                                                                            onChange={({ target: { name, value } }) => handleTableInputChange(step.id, name, value)}
                                                                            formErrors={formErrors}
                                                                            showErrors={isValidationErrorsShown}
                                                                            rows={4}
                                                                            className="border h-20 border-gray-300 rounded w-full p-2"
                                                                        />
                                                                    </td>

                                                                    <td className="p-4">
                                                                        <div className="cursor-pointer justify-center flex"
                                                                            onClick={() => removeStep(step.id)}>
                                                                            <XMarkIcon className="w-6 h-6 text-gray-500" />
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                    <div className="flex space-x-4 mt-10 self-end w-full">
                                        <button
                                            onClick={handleClose}
                                            className="px-4 py-2 text-gray-700 rounded w-1/4 border border-black cursor-pointer disabled:cursor-not-allowed"
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-primary-pink text-white rounded hover:bg-pink-600 w-3/4 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                            disabled={isSubmitting}
                                        >
                                            Create
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default TestCaseCreateComponent;
