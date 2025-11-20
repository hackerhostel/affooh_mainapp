import {useDispatch, useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import {selectProjectList, selectSelectedProject} from "../../state/slice/projectSlice.js";
import {PlusCircleIcon} from "@heroicons/react/24/outline/index.js";
import {doGetTestCaseFormData, selectTestCaseStatuses} from "../../state/slice/testCaseFormDataSlice.js";
import {selectSprintListForProject} from "../../state/slice/sprintSlice.js";
import {selectProjectUserList} from "../../state/slice/projectUsersSlice.js";
import {doGetTestPlans, setSelectedTestPlan} from "../../state/slice/testPlansSlice.js";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {
    doGetReleases,
    selectIsReleaseListForProjectError,
    selectIsReleaseListForProjectLoading,
    selectReleaseListForProject
} from "../../state/slice/releaseSlice.js";
import useFetchTestPlan from "../../hooks/custom-hooks/test-plan/useFetchTestPlan.jsx";
import TestSuiteEditComponent from "./TestSuiteEditComponent.jsx";
import TestSuiteCreateComponent from "./TestSuiteCreateComponent.jsx";
import useValidation from "../../utils/use-validation.jsx";
import {TestPlanEditSchema} from "../../utils/validationSchemas.js";
import {useToasts} from "react-toast-notifications";
import axios from "axios";
import useFetchTestCases from "../../hooks/custom-hooks/test-plan/useFetchTestCases.jsx";
import {getSelectOptions} from "../../utils/commonUtils.js";

const TestPlanEditComponent = ({test_plan_id}) => {
    const dispatch = useDispatch();
    const {addToast} = useToasts();

    const selectedProject = useSelector(selectSelectedProject);
    const projects = useSelector(selectProjectList);
    const testCaseStatuses = useSelector(selectTestCaseStatuses);
    const sprintListForProject = useSelector(selectSprintListForProject);
    const projectUserList = useSelector(selectProjectUserList);
    const releases = useSelector(selectReleaseListForProject)
    const releaseLoading = useSelector(selectIsReleaseListForProjectLoading)
    const releaseError = useSelector(selectIsReleaseListForProjectError)

    const [testPlanId, setTestPlanId] = useState(0);
    const [testSuiteId, setTestSuiteId] = useState(0);
    const [formValues, setFormValues] = useState({
        name: '',
        sprintId: 0,
        projectId: selectedProject.id,
        releaseId: 0,
        status: 'TODO'
    });
    const [formErrors] = useValidation(TestPlanEditSchema, formValues);
    const [isTestSuiteCreateOpen, setIsTestSuiteCreateOpen] = useState(false);
    const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const testPlanStatus = [
        {value: 'TODO', label: 'TODO'},
        {value: 'IN PROGRESS', label: 'IN PROGRESS'},
        {value: 'DONE', label: 'DONE'}
    ];

    const {loading, error, data: testPlan, refetch: reFetchTestPlan} = useFetchTestPlan(testPlanId)
    const {data: testCasesForProject, refetch: refetchTestCases} = useFetchTestCases(selectedProject?.id)

    useEffect(() => {
        if (test_plan_id !== 0) {
            setTestPlanId(test_plan_id)
        }
    }, [test_plan_id]);

    useEffect(() => {
        if (selectedProject?.id) {
            dispatch(doGetReleases(selectedProject?.id));
            dispatch(doGetTestCaseFormData(selectedProject?.id))
        }
    }, [selectedProject]);

    useEffect(() => {
        if (testPlan?.id) {
            setFormValues({
                name: testPlan.name,
                sprintId: testPlan.sprintID,
                projectId: testPlan.projectID,
                releaseId: testPlan.releaseID,
                status: testPlan.status
            })
            dispatch(setSelectedTestPlan(testPlan))
        }
    }, [testPlan]);

    const handleFormChange = (name, value, isText) => {
        setFormValues({...formValues, [name]: isText ? value : Number(value)});
        setIsValidationErrorsShown(false)
    };

    const onTestSuiteAddNew = () => {
        setIsTestSuiteCreateOpen(true)
    }

    const handleTestSuiteEditClose = (updated) => {
        setTestSuiteId(0)
        if (updated === true) {
            reFetchTestPlan()
        }
    };

    const handleTestSuiteCreateClose = (created) => {
        setIsTestSuiteCreateOpen(false);
        if (created === true) {
            reFetchTestPlan()
        }
    };

    const updateTestPlan = async (event) => {
        setIsSubmitting(true)
        event.preventDefault();

        if (formErrors && Object.keys(formErrors).length > 0) {
            setIsValidationErrorsShown(true);
        } else {
            setIsValidationErrorsShown(false);
            try {
                const response = await axios.put(`/test-plans/${test_plan_id}`, {testPlan: formValues})
                const updated = response?.data?.status

                if (updated) {
                    addToast('Test Plan Successfully Updated', {appearance: 'success'});
                    dispatch(doGetTestPlans(selectedProject?.id));
                    await reFetchTestPlan()
                } else {
                    addToast('Failed To Update The Test Plan ', {appearance: 'error'});
                }
            } catch (error) {
                console.log(error)
                addToast('Failed To Update The Test Plan ', {appearance: 'error'});
            }
        }
        setIsSubmitting(false)
    }

    if (loading || releaseLoading) {
        return <div className="m-10"><SkeletonLoader/></div>;
    }

    if (error || releaseError) {
        return <ErrorAlert message={error.message}/>;
    }

    return (
        <div className={"p-4 bg-dashboard-bgc"}>
            <div className="mt-3">
                {testPlan?.id && (
                    <p className={"text-secondary-grey font-bold text-sm align-left"}>Projects <span
                        className="mx-1"> &gt; </span> <span className="text-black">{testPlan.name}</span></p>
                )}

            </div>
            <p className={"text-secondary-grey font-bold text-2xl mb-4 mt-10"}>Test Plan</p>
            {!testPlan?.id ? (
                <div className="p-8 text-center">No Details Available, Please Select a Test plan </div>
            ) : (
                <>
                    <div className={"flex-col"}>
                        <div className={"bg-white p-4 rounded-md h-32 mb-7"}>
                            <form className="flex flex-col items-end" onSubmit={updateTestPlan}>
                                <div className="flex justify-between w-full gap-4">
                                    <div className={"flex-col w-1/4 h-10"}>
                                        <p className={"text-secondary-grey"}>Name</p>
                                        <FormInput
                                            type="text"
                                            name="name"
                                            formValues={formValues}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, true)}
                                            formErrors={formErrors}
                                            showErrors={isValidationErrorsShown}
                                        />
                                    </div>
                                    <div className={"flex-col w-1/4"}>
                                        <p className={"text-secondary-grey"}>Sprint</p>
                                        <FormSelect
                                            name="sprintId"
                                            formValues={formValues}
                                            options={sprintListForProject.length ? getSelectOptions(sprintListForProject) : []}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, false)}
                                        />
                                    </div>
                                    <div className={"flex-col w-1/4"}>
                                        <p className={"text-secondary-grey"}>Project</p>
                                        <FormSelect
                                            name="projectId"
                                            formValues={formValues}
                                            options={projects.length ? getSelectOptions(projects) : []}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, false)}
                                            disabled={true}
                                        />
                                    </div>
                                    <div className={"flex-col w-1/5"}>
                                        <p className={"text-secondary-grey"}>Release</p>
                                        <FormSelect
                                            name="releaseId"
                                            formValues={formValues}
                                            options={releases.length ? getSelectOptions(releases) : []}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, false)}
                                        />
                                    </div>
                                    <div className={"flex-col w-1/5"}>
                                        <p className={"text-secondary-grey"}>Status</p>
                                        <FormSelect
                                            name="status"
                                            formValues={formValues}
                                            options={testPlanStatus}
                                            onChange={({target: {name, value}}) => handleFormChange(name, value, true)}
                                        />
                                    </div>
                                </div>
                                <button type="submit"
                                        className="px-8 py-2 mt-2 bg-primary-pink text-white rounded hover:bg-pink-600 cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        disabled={isSubmitting}>Update
                                </button>
                            </form>
                        </div>
                        {testCasesForProject && testCasesForProject?.length ? (<>
                            <div className={"flex gap-8 mb-3"}>
                                <p className={"text-secondary-grey font-bold text-lg"}>Test Suites</p>
                                <div className={"flex gap-1 items-center mr-5 cursor-pointer"}
                                     onClick={onTestSuiteAddNew}>
                                    <PlusCircleIcon className={"w-6 h-6 text-pink-500"}/>
                                    <span className="font-thin text-xs text-gray-600">Add New</span>
                                </div>
                            </div>
                            <div className={"bg-white p-4 rounded-md min-h-44 flex items-center mb-10"}>
                                {testPlan?.testSuites && testPlan?.testSuites.length ? (
                                        <div className={"flex gap-4 w-full overflow-x-auto"}>
                                            {testPlan.testSuites.map(ts => (
                                                <div key={ts.id}
                                                     className={"flex flex-col gap-4 min-w-52 bg-dark-white border border-gray-200 rounded p-4 mb-4 cursor-pointer"}
                                                     onClick={() => setTestSuiteId(ts.id)}
                                                >
                                                    <p className={"text-secondary-grey font-bold text-base"}>{ts?.summary}</p>
                                                    {ts?.status && (
                                                        <p className={"text-secondary-grey text-xs bg-in-progress py-1 px-2 w-fit rounded"}>{testCaseStatuses.length ? testCaseStatuses.filter(tcs => tcs.id === ts?.status)[0]?.value : ''}</p>)}
                                                    {ts?.assignee && (<div className={"flex gap-5"}>
                                                        <div
                                                            className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
                                                            {projectUserList.length ? (() => {
                                                                const user = projectUserList.find(pul => pul.id === ts.assignee);
                                                                return `${user?.firstName?.[0] || 'N/'}${user?.lastName?.[0] || 'A'}`;
                                                            })() : "N/A"}
                                                        </div>
                                                        <p className={"text-secondary-grey text-xs mt-3"}>
                                                            {projectUserList.length ? (() => {
                                                                const user = projectUserList.find(pul => pul.id === ts.assignee);
                                                                return user?.firstName || "N/A";
                                                            })() : "N/A"}
                                                        </p>
                                                    </div>)}
                                                </div>))}
                                        </div>) :
                                    (<p className={"text-secondary-grey text-xs text-center w-full"}>No test suites</p>)
                                }
                            </div>
                        </>) : (<></>)}
                        <TestSuiteEditComponent testSuiteId={testSuiteId} onClose={handleTestSuiteEditClose}
                                                testCasesForProject={testCasesForProject}
                                                refetchTestCases={refetchTestCases}/>
                    </div>
                    <TestSuiteCreateComponent isOpen={isTestSuiteCreateOpen} onClose={handleTestSuiteCreateClose}/>
                </>
            )}
        </div>
    )
}

export default TestPlanEditComponent;