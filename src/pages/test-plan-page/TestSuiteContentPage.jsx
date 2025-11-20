import { useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState, useCallback } from "react";
import { selectSelectedTestPlanId } from "../../state/slice/testPlansSlice.js";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {
  ArrowPathRoundedSquareIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline/index.js";
import {
  doGetTestCaseFormData,
  selectTestCaseStatuses,
} from "../../state/slice/testCaseFormDataSlice.js";
import { selectSelectedProject } from "../../state/slice/projectSlice.js";
import FormSelect from "../../components/FormSelect.jsx";
import { getInitials, getSelectOptions } from "../../utils/commonUtils.js";
import useFetchTestPlan from "../../hooks/custom-hooks/test-plan/useFetchTestPlan.jsx";
import useFetchTestExecution from "../../hooks/custom-hooks/test-plan/useFetchTestExecution.jsx";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useToasts } from "react-toast-notifications";
import { useHistory } from "react-router-dom";
import FormTextArea from "../../components/FormTextArea.jsx";
import AddIssue from "./AddIssue.jsx";
import IssueListPopup from "./IssueListPopup.jsx";
import useFetchTestSuite from "../../hooks/custom-hooks/test-plan/useFetchTestSuite.jsx";
import useFetchIssue from "../../hooks/custom-hooks/test-plan/useFetchIssue.jsx";
import { doGetIssueCount } from "../../state/slice/testIssueSlice.js";
import debounce from "lodash/debounce"; 

const TestSuiteContentPage = () => {
  const dispatch = useDispatch();
  const { addToast } = useToasts();
  const history = useHistory();

  const selectedProject = useSelector(selectSelectedProject);
  const selectedTestPlanId = useSelector(selectSelectedTestPlanId);
  const testCaseStatuses = useSelector(selectTestCaseStatuses);

  const [testExecutionCycles, setTestExecutionCycles] = useState([]);
  const [testExecutionOptions, setTestExecutionOptions] = useState([]);
  const [testExecutions, setTestExecutions] = useState([]);
  const [testPlan, setTestPlan] = useState({});
  const [testPlanId, setTestPlanId] = useState(0);
  const [testSuiteId, setTestSuiteId] = useState(0);
  const [testCycleId, setTestCycleId] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenAddIssue, setIsOpenAddIssue] = useState(false);
  const [isOpenIssueList, setIsIssueList] = useState(false);
  const [selectedTestCaseId, setSelectedTestCaseId] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [statusCounts, setStatusCounts] = useState({
    all: 0,
    pass: 0,
    fail: 0,
    pending: 0,
  });
  const [issueCounts, setIssueCounts] = useState([]); 
  const [issueCountsLoading, setIssueCountsLoading] = useState(false);
  const [issueCountCache, setIssueCountCache] = useState({}); 

  const { fetchTestSuite } = useFetchTestSuite(testSuiteId);
  const {
    data: issues,
    error: issueError,
    loading: issueLoading,
    refetch: fetchIssue,
  } = useFetchIssue(testSuiteId, testCycleId);

  const {
    loading: testPlanLoading,
    error: testPlanError,
    data: testPlanResponse,
  } = useFetchTestPlan(testPlanId);
  const {
    loading: testExecutionLoading,
    error: testExecutionError,
    data: testExecutionResponse,
    refetch: refetchTextExecution,
  } = useFetchTestExecution(testSuiteId, testCycleId);

  useEffect(() => {
    if (testPlanResponse?.id) {
      setTestPlan(testPlanResponse);
      setTestExecutionCycles([]);
      setTestExecutionOptions([]);
      let testEOP = testPlanResponse?.testExecutionOptions || [];
      if (testEOP.length) {
        setTestExecutionOptions(testEOP);
       
        const firstSuiteId = testEOP[0].id;
        setTestSuiteId(firstSuiteId);

        
        const firstSuiteCycles = testEOP[0]?.cycles || [];
        if (firstSuiteCycles.length) {
          setTestExecutionCycles(firstSuiteCycles);
          setTestCycleId(firstSuiteCycles[0].id);
        }
      }
    }
    if (!testCaseStatuses.length) {
      dispatch(doGetTestCaseFormData(selectedProject?.id));
    }
  }, [testPlanResponse, dispatch, selectedProject, testCaseStatuses]);

  useEffect(() => {
    if (selectedTestPlanId !== 0 && testPlan?.id !== selectedTestPlanId) {
      setTestPlanId(selectedTestPlanId);
    }
    if (selectedTestPlanId === 0) {
      setTestPlan({});
    }
  }, [selectedTestPlanId]);

  useEffect(() => {
    if (testExecutionResponse?.length) {
      setTestExecutions(testExecutionResponse);
    } else {
      setTestExecutions([]);
    }
  }, [testExecutionResponse]);

  useEffect(() => {
    setStatusCounts({
      ...statusCounts,
      all: testExecutions?.length,
      pass: testExecutions?.filter((item) => item.status === 20).length,
      fail: testExecutions?.filter((item) => item.status === 21).length,
      pending: testExecutions?.filter((item) => item.status === 13).length,
    });
  }, [testExecutions]);

  useEffect(() => {
    if (testSuiteId !== 0) {
      const filteredTestExecutionCycles =
        testExecutionOptions.filter((to) => to.id === Number(testSuiteId))[0]
          ?.cycles || [];
      if (filteredTestExecutionCycles.length) {
        setTestExecutionCycles(filteredTestExecutionCycles);
        
        setTestCycleId(filteredTestExecutionCycles[0].id);
      } else {
        setTestExecutionCycles([]);
        setTestCycleId(0);
      }
    }
  }, [testSuiteId, testExecutionOptions]);

  useEffect(() => {
    if (testSuiteId) {
      fetchTestSuite();
      fetchIssue();
    }
  }, [testSuiteId]);

  // Debounced function to fetch issue counts
  const fetchIssueCounts = useCallback(
    debounce(async () => {
      if (!testSuiteId || !testCycleId || !testExecutions.length) return;

      setIssueCountsLoading(true);
      const counts = [];
      for (const execution of testExecutions) {
        if (execution.testCaseID) {
          const cacheKey = `${execution.testCaseID}-${execution.platform}-${testCycleId}`;
          // Check if count is in cache
          if (issueCountCache[cacheKey] !== undefined) {
            counts.push({
              testCycleExecutionID: execution.testCycleExecutionID,
              count: issueCountCache[cacheKey],
            });
            continue;
          }

          const response = await dispatch(
            doGetIssueCount({
              testSuiteID: testSuiteId,
              testCaseID: execution?.testCaseID,
              platform: execution?.platform,
              testCycleID: testCycleId,
            })
          );

          if (response.payload?.count !== undefined) {
            const count = response.payload.count;
            // Update cache
            setIssueCountCache((prev) => ({
              ...prev,
              [cacheKey]: count,
            }));
            counts.push({
              testCycleExecutionID: execution.testCycleExecutionID,
              count,
            });
          }
        }
      }
      setIssueCounts(counts);
      setIssueCountsLoading(false);
    }, 500), // 500ms debounce
    [testSuiteId, testCycleId, testExecutions, dispatch, issueCountCache]
  );

  // Trigger issue count fetch only on testSuiteId or testCycleId change
  useEffect(() => {
    fetchIssueCounts();
    return () => fetchIssueCounts.cancel(); 
  }, [testSuiteId, testCycleId, fetchIssueCounts]);

  const handleAddIssue = (testCaseID, platform) => {
    setSelectedTestCaseId(testCaseID);
    setSelectedPlatform(platform);
    setIsOpenAddIssue(true);
  };

  const handleIssueList = (testCaseID, platform) => {
    setSelectedTestCaseId(testCaseID);
    setSelectedPlatform(platform);
    setIsIssueList(true);
  };

  const handleAddIssueClose = async (issueAdded) => {
    setIsOpenAddIssue(false);
    if (issueAdded) {
      await fetchTestSuite(); 
      await fetchIssue(); 
      const updatedExecutions = await refetchTextExecution(true); 
      setTestExecutions(updatedExecutions || []); 
      setTestSuiteId((prev) => prev); // Trigger re-render if needed
      fetchIssueCounts(); 
    }
    setSelectedTestCaseId(null);
    setSelectedPlatform(null);
  };

  const handleSuiteChange = (value) => {
    if (value) {
      setTestSuiteId(Number(value));
      setIssueCounts([]); 
    }
  };

  const handleCycleChange = (value) => {
    if (value) {
      setTestCycleId(Number(value));
      setIssueCounts([]); 
    }
  };

  const openTestSuiteEdit = () => {
    history.push(`/test-plans/${testPlanId}`);
  };

  const updateRow = async (rowID, updatedData) => {
    setIsUpdating(true);
    try {
      const response = await axios.put("/test-case/update", {
        testExecData: updatedData,
      });
      if (response) {
        setIsUpdating(false);
        addToast("Successfully Updated Test Execution Item", {
          appearance: "success",
        });
        refetchTextExecution(true);
        
        setStatusCounts({
          ...statusCounts,
          all: testExecutions.length,
          pass: testExecutions.filter((item) => item.status === 20).length,
          fail: testExecutions.filter((item) => item.status === 21).length,
          pending: testExecutions.filter((item) => item.status === 13).length,
        });
      }
    } catch (e) {
      setIsUpdating(false);
      addToast("Failed To Update Test Execution Item", { appearance: "error" });
    }
  };

  if (testPlanLoading || issueLoading) {
    return (
      <div className="m-10">
        <SkeletonLoader />
      </div>
    );
  }

  if (testPlanError || testExecutionError || issueError) {
    return (
      <ErrorAlert
        message={
          testPlanError?.message ||
          testExecutionError?.message ||
          issueError?.message
        }
      />
    );
  }

  const StatusCount = ({ count, label, variant = "default" }) => {
    const variants = {
      default: "border-gray-300 text-gray-600",
      success: "border-green-500 text-green-600",
      danger: "border-red-500 text-red-600",
      warning: "border-yellow-500 text-yellow-600",
    };

    return (
      <div
        className={`flex flex-col items-center justify-center p-4 rounded-lg min-w-[200px] border-2 ${variants[variant]}`}
        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <span className="text-2xl font-semibold mb-1">{count}</span>
        <span className="text-sm">{label}</span>
      </div>
    );
  };

  const GenerateRow = (props) => {
    const { row, issueCount } = props;
    const [open, setOpen] = React.useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [status, setStatus] = React.useState(row?.status || 8);
    const [note, setNote] = React.useState(row?.notes || "");
    const [noteChanged, setNoteChanged] = React.useState(false);

    const handleStatusUpdate = (name, value) => {
      setStatus(value);
      setEditMode(true);
    };

    const onNoteChange = (value) => {
      if (value || value === "") {
        setNoteChanged(true);
        setNote(value);
        setEditMode(true);
      } else {
        setNoteChanged(false);
        setNote(row.notes);
      }
    };

    const onSaveNote = async () => {
      setNoteChanged(false);
      setEditMode(false);
      props.onUpdate(row.testCycleExecutionID, { ...row, notes: note, status });
    };

    const onCancelEdit = () => {
      setEditMode(false);
      setNoteChanged(false);
      setNote(row.notes);
      setStatus(row.status);
    };

    const handleExpandToggle = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <>
        <tr className="border-b hover:bg-slate-100">
          <td className="px-4 py-2">
            <div
              className="text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => setOpen(!open)}
            >
              {open ? (
                <ChevronDownIcon
                  className={"w-4 h-4 text-black cursor-pointer"}
                />
              ) : (
                <ChevronRightIcon
                  className={"w-4 h-4 text-black cursor-pointer"}
                />
              )}
            </div>
          </td>
          <td className="w-42 px-4 py-2 text-secondary-text-color">
            {isExpanded ? (
              <>
                {row?.summary}
                <span
                  className="text-secondary-text-color ml-2 cursor-pointer hover:underline"
                  onClick={handleExpandToggle}
                >
                  ....
                </span>
              </>
            ) : (
              <>
                {row?.summary?.slice(0, 20)}
                <span
                  className="text-secondary-text-color ml-2 cursor-pointer hover:underline"
                  onClick={handleExpandToggle}
                >
                  ....
                </span>
              </>
            )}
          </td>
          <td className="px-4 py-2 text-secondary-text-color">
            {row?.platform}
          </td>
          <td className="px-4 py-2 text-secondary-text-color">
            {row?.priority}
          </td>
          <div className="flex items-center mt-3 px-4 py-2 text-secondary-text-color">
            <td className="px-4 py-2">
              {issueCountsLoading ? (
                <ArrowPathRoundedSquareIcon className={"w-4 h-4 text-black"} />
              ) : (
                <button
                  className="px-2 py-1 bg-white rounded-sm border-count-notification"
                  onClick={() => handleIssueList(row.testCaseID, row.platform)}
                >
                  {issueCount}
                </button>
              )}
            </td>
            <PlusCircleIcon
              className={"w-8 h-8 items-center text-pink-500 cursor-pointer"}
              onClick={() => handleAddIssue(row.testCaseID, row.platform)}
            />
          </div>
          <td className="px-4 py-2">
            <div className="w-10 h-10 rounded-full bg-primary-pink flex items-center justify-center text-white text-lg font-semibold">
              {row?.assignee ? getInitials(row?.assignee) : "N/A"}
            </div>
          </td>
          <td className="px-4 py-2 text-secondary-text-color">
            <div>
              <select
                disabled={isUpdating && !editMode}
                onChange={({ target: { name, value } }) =>
                  handleStatusUpdate(name, value)
                }
                value={status}
                className="w-24 h-8 text-xs border border-gray-300 rounded py-1"
              >
                {testCaseStatuses.map((option) => (
                  <option key={option?.id} value={option?.id}>
                    {option?.value}
                  </option>
                ))}
              </select>
            </div>
          </td>
          <td className="px-4 py-2">
            <div className="relative">
              <FormTextArea
                name="note"
                formValues={{ note }}
                disabled={isUpdating && !editMode}
                type="text"
                value={note || ""}
                onChange={(e) => onNoteChange(e.target.value)}
                className="px-4 py-2 w-54 h-10 mt-3 border rounded-lg focus:outline-none focus:ring-2 text-secondary-text-color focus:ring-blue-500 pr-20"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {editMode && (
                  <div>
                    <button
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Cancel edit"
                    >
                      <XMarkIcon
                        onClick={onCancelEdit}
                        className="w-5 h-5 text-gray-500"
                      />
                    </button>
                    <button
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Save input"
                    >
                      <CheckIcon
                        onClick={onSaveNote}
                        className="w-5 h-5 text-green-500"
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
        {row?.steps && row.steps.length > 0 && (
          <tr className="py-0">
            <td className="p-2" colSpan={8}>
              <div
                className={`overflow-hidden transition-[max-height] duration-300 ${
                  open ? "max-h-[1000px]" : "max-h-0"
                } px-5`}
              >
                <div className="rounded-xl border p-4 bg-slate-50 shadow-sm">
                  <p className="text-gray-600 font-medium mb-4">
                    Verify that the system validates the email address
                  </p>
                  <table className="min-w-full border-collapse rounded-xl overflow-hidden">
                    <thead>
                      <tr>
                        <th className="px-4 py-2"></th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Steps
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Input Data
                        </th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-700">
                          Expected Outcome
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {row.steps.map((step) => (
                        <tr key={step.id}>
                          <td className="px-4 py-2"></td>
                          <td className="px-4 py-2 w-96 text-secondary-text-color">
                            {step?.description}
                          </td>
                          <td className="px-4 py-2 text-secondary-text-color">
                            {step?.inputData}
                          </td>
                          <td className="px-4 py-2 text-secondary-text-color">
                            {step?.expectedOutcome}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </td>
          </tr>
        )}
      </>
    );
  };

  return (
    <div className={"p-2 bg-dashboard-bgc h-full"}>
      <div className={"flex w-full justify-between items-center mb-10 mt-6"}>
        <div>
          {testPlan?.id && (
            <p
              className={
                "text-secondary-grey font-bold text-sm align-left flex items-center"
              }
            >
              Test Plan{" "}
              <span className="mx-1">
                <ChevronRightIcon className="w-4 h-4 text-secondary-grey" />
              </span>{" "}
              <span className="text-black">{testPlan.name}</span>
            </p>
          )}
          <p
            className={
              "text-secondary-grey font-bold text-xl align-middle mt-11"
            }
          >
            Test Execution List
          </p>
        </div>
        <div className={"flex space-x-4 justify-end items-center w-auto"}>
          {testPlanId !== 0 && testExecutionOptions.length > 0 && (
            <div>
              <FormSelect
                name="suite"
                className="w-28 h-10"
                formValues={{ suite: testSuiteId }}
                options={
                  testExecutionOptions.length
                    ? getSelectOptions(testExecutionOptions)
                    : []
                }
                onChange={({ target: { value } }) => handleSuiteChange(value)}
              />
            </div>
          )}
          {testCycleId !== 0 && testExecutionCycles.length > 0 && (
            <div>
              <FormSelect
                name="cycle"
                className="w-32 h-10"
                formValues={{ cycle: testCycleId }}
                options={
                  testExecutionCycles.length
                    ? getSelectOptions(testExecutionCycles)
                    : []
                }
                onChange={({ target: { value } }) => handleCycleChange(value)}
              />
            </div>
          )}
          {testExecutionOptions.length > 0 &&
            testExecutionCycles.length > 0 && (
              <button
                onClick={openTestSuiteEdit}
                className="bg-primary-pink text-white px-4 rounded-lg w-32 h-10"
              >
                Edit
              </button>
            )}
        </div>
      </div>
      {testPlanId === 0 ? (
        <div className="p-8 text-center">
          No Details Available, Please Select a Test Plan
        </div>
      ) : testPlanLoading ? (
        <div className="p-8 text-center">Loading Test Plan Details...</div>
      ) : testExecutionOptions?.length === 0 ? (
        <div className="p-8 text-center flex flex-col gap-4 items-center">
          <p>No Test Suites Available, Please Create a Test Suite</p>
          <button
            className="btn-primary w-24"
            onClick={() => history.push(`/test-plans/${selectedTestPlanId}`)}
          >
            Start
          </button>
        </div>
      ) : testCycleId === 0 ? (
        <div className="p-8 text-center">Loading Test Cycle Details...</div>
      ) : (
        <div className={"flex-col h-[calc(100vh-250px)] overflow-y-auto"}>
          <div className={"p-4 rounded-md"}>
            {testExecutionLoading ? (
              <div className="m-10">
                <SkeletonLoader />
              </div>
            ) : (
              <>
                <div
                  className={"bg-white p-4 rounded-md mb-5 -mt-7 h-40 -ml-3"}
                >
                  <div className="flex gap-4 justify-around mt-3">
                    <StatusCount
                      count={statusCounts.all}
                      label="All"
                      variant="default"
                    />
                    <StatusCount
                      count={statusCounts.pass}
                      label="Pass"
                      variant="success"
                    />
                    <StatusCount
                      count={statusCounts.fail}
                      label="Fail"
                      variant="danger"
                    />
                    <StatusCount
                      count={statusCounts.pending}
                      label="Pending"
                      variant="warning"
                    />
                  </div>
                </div>
                <table className="min-w-full rounded-md border-collapse bg-white -ml-3">
                  <thead>
                    <tr className="h-16 text-secondary-grey">
                      <th className="px-4 py-2"></th>
                      <th className="px-4 py-2 text-left">Summary</th>
                      <th className="px-4 py-2 text-left">Platform</th>
                      <th className="px-4 py-2 text-left">Priority</th>
                      <th className="px-4 py-2 text-center">Issues</th>
                      <th className="px-4 py-2 text-left">Assignee</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testExecutions.map((row) => (
                      <GenerateRow
                        row={row}
                        key={row.testCycleExecutionID}
                        issueCount={
                          issueCounts.find(
                            (ic) =>
                              ic.testCycleExecutionID ===
                              row.testCycleExecutionID
                          )?.count || 0
                        }
                        onUpdate={updateRow}
                      />
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
          <AddIssue
            isOpen={isOpenAddIssue}
            onClose={handleAddIssueClose}
            testSuiteID={testSuiteId}
            testCaseID={selectedTestCaseId}
            platform={selectedPlatform}
            testCycleID={testCycleId}
            fetchTestSuite={fetchTestSuite}
          />
          <IssueListPopup
            isOpen={isOpenIssueList}
            onClose={() => setIsIssueList(false)}
            testSuiteID={testSuiteId}
            testCaseID={selectedTestCaseId}
            platform={selectedPlatform}
            testCycleID={testCycleId}
          />
        </div>
      )}
    </div>
  );
};

export default TestSuiteContentPage;
