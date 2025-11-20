import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import SearchBar from "../../components/SearchBar.jsx";
import SkeletonLoader from "../../components/SkeletonLoader.jsx";
import ErrorAlert from "../../components/ErrorAlert.jsx";
import {EllipsisVerticalIcon} from "@heroicons/react/24/outline/index.js";
import ConfirmationDialog from "../../components/ConfirmationDialog.jsx";
import {
  doGetTestPlans,
  selectIsTestPlanListForProjectError,
  selectIsTestPlanListForProjectLoading,
  selectSelectedTestPlanId,
  selectTestPlanListForProject,
  setSelectedTestPlanId,
} from "../../state/slice/testPlansSlice.js";
import {selectSelectedProject} from "../../state/slice/projectSlice.js";
import {useHistory} from "react-router-dom";
import {useToasts} from "react-toast-notifications";
import axios from "axios";

const TestPlanListPage = () => {
  const {addToast} = useToasts();
  const dispatch = useDispatch();
  const history = useHistory();

  const testPlansError = useSelector(selectIsTestPlanListForProjectError);
  const testPlansLoading = useSelector(selectIsTestPlanListForProjectLoading);
  const testPlans = useSelector(selectTestPlanListForProject);
  const selectedProject = useSelector(selectSelectedProject);
  const selectedTestPlanId = useSelector(selectSelectedTestPlanId);
  const [openMenu, setOpenMenu] = useState(null);
  const [filteredTestPlans, setFilteredTestPlans] = useState([]);
  const [selectedFilters, setSelectedFilters] = useState({
    todo: true,
    inProgress: true,
    done: true,
  });

  const [filterCounts, setFilterCounts] = useState({
    todo: 0,
    inProgress: 0,
    done: 0,
  });

  const [toDeleteTestPlan, setToDeleteTestPlan] = useState({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (selectedProject?.id) {
      dispatch(doGetTestPlans(selectedProject?.id));
    }
  }, [selectedProject, dispatch]);

  useEffect(() => {
    if (testPlans.length) {
      const todoCount = testPlans.filter((tp) => tp.status === "TODO").length;
      const inProgressCount = testPlans.filter((tp) => tp.status === "IN PROGRESS").length;
      const doneCount = testPlans.filter((tp) => tp.status === "DONE").length;

      setFilterCounts({ todo: todoCount, inProgress: inProgressCount, done: doneCount });
      handleSearch("");
    }else{
      setFilterCounts({ todo: 0, inProgress: 0, done: 0 });
      handleSearch("");
    }
  }, [testPlans]);

  const handleSearch = (term) => {
    let filtered = testPlans;

    if (term.trim()) {
      filtered = filtered.filter((tp) => tp.name.toLowerCase().includes(term.toLowerCase()));
    }

    filtered = filtered.filter((tp) => {
      if (selectedFilters.todo && tp.status === "TODO") return true;
      if (selectedFilters.inProgress && tp.status === "IN PROGRESS") return true;
      if (selectedFilters.done && tp.status === "DONE") return true;
      return false;
    });

    setFilteredTestPlans(filtered);
  };

  const handleFilterChange = (filterName) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterName]: !prev[filterName],
    }));
  };

  useEffect(() => {
    handleSearch('');
  }, [selectedFilters]);

  const handleDeleteClick = (testPlan) => {
    setToDeleteTestPlan(testPlan);
    setIsDialogOpen(true);
  };

  const handleTestPlanEditClick = (test_plan_id) => {
    setOpenMenu(null)
    history.push(`/test-plans/${test_plan_id}`);
  };

  const handleTestPlanExecutionClick = (test_plan_id) => {
    dispatch(setSelectedTestPlanId(test_plan_id))
    history.push(`/test-plans/`);
  };

  const handleDeleteConfirm = async () => {
    try {
      const test_plan_id = toDeleteTestPlan?.id
      setIsDialogOpen(false);
      setOpenMenu(null)

      const response = await axios.delete(`/test-plans/${test_plan_id}`)
      const deleted = response?.data?.status

      if (deleted) {
        addToast('Test Plan Successfully Deleted', {appearance: 'success'});
        dispatch(doGetTestPlans(selectedProject?.id));
        if (test_plan_id === selectedTestPlanId) {
          handleTestPlanExecutionClick(0)
        }
      } else {
        addToast('Failed To Deleted The Test Plan ', {appearance: 'error'});
      }
    } catch (error) {
      addToast('Failed To Deleted The Test Plan ', {appearance: 'error'});
    }
  };

  const toggleMenuOpen = (index, event) => {
    if (openMenu?.index === index) {
      setOpenMenu(null);
    } else {
      setOpenMenu({
        index: index,
        position: {
          top: event.screenY,
        },
      });
    }
  };

  if (testPlansError) return <ErrorAlert message="Failed to fetch test plans at the moment" />;

  return (
    <div className="h-list-screen w-full">
      {testPlansLoading ? (
        <div className="p-2">
          <SkeletonLoader />
        </div>
      ) : (
        <div className="flex-col gap-4">
          <div className="flex flex-col gap-4 -mt-2 pl-3 pr-3">
            <SearchBar onSearch={handleSearch}/>
            <div className="flex w-full laptopL:w-60 justify-between ml-3">
              <button
                  className={`px-2 py-1 rounded-xl text-xs ${
                      selectedFilters.todo ? "bg-primary-pink text-white" : "bg-gray-200"
                  }`}
                  onClick={() => handleFilterChange("todo")}
              >
                Todo ({filterCounts.todo})
              </button>
              <button
                  className={`px-2 py-1 rounded-xl text-xs ${
                      selectedFilters.inProgress ? "bg-primary-pink text-white" : "bg-gray-200"
                  }`}
                  onClick={() => handleFilterChange("inProgress")}
              >
                In Progress ({filterCounts.inProgress})
              </button>
              <button
                  className={`px-2 py-1 rounded-xl text-xs ${
                      selectedFilters.done ? "bg-primary-pink text-white" : "bg-gray-200"
                  }`}
                  onClick={() => handleFilterChange("done")}
              >
                Done ({filterCounts.done})
              </button>
            </div>
          </div>
          <div className="h-[calc(100vh-300px)] overflow-y-auto flex flex-col gap-3 pl-3 pr-1 mt-12">
            {filteredTestPlans.length === 0 ? (
                <div className="text-center text-gray-600">No test plans found</div>
            ) : (
                filteredTestPlans.slice().reverse().map((tp, index) => (
                <div
                  key={tp.id}
                  className={`flex justify-between items-center p-3 border rounded-md w-full gap-2 hover:bg-gray-100 cursor-pointer ${selectedTestPlanId === tp.id ? 'border-primary-pink' : 'border-gray-200'}`}
                >
                  <div
                      className="col-span-2 text-left flex gap-2 flex-grow"
                      onClick={() => handleTestPlanExecutionClick(tp.id)}
                  >
                    <div className="flex flex-col gap-2 justify-center">
                      <div className="font-bold">{tp.name}</div>
                      <div className="text-xs text-gray-600">{tp.sprintName}</div>
                    </div>
                  </div>
                  <div className="gap-1 flex">
                    <div onClick={(event) => toggleMenuOpen(index, event)}>
                      <EllipsisVerticalIcon className="w-4 h-4 text-black z-10"/>
                    </div>
                  </div>
                  {openMenu?.index === index && (
                      <div
                          style={{
                            position: "absolute",
                            top: `calc(${openMenu.position.top}px - 200px)`,
                          }}
                          className="left-full mt-2 w-24 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                        <button
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer z-20"
                            onClick={() => handleTestPlanEditClick(tp?.id)}>
                          EDIT
                        </button>
                        <button
                            className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 focus:outline-none cursor-pointer z-20"
                            onClick={() => handleDeleteClick(tp)}>
                          DELETE
                        </button>
                      </div>
                  )}
                </div>
                ))
            )}
          </div>
        </div>
      )}
      <ConfirmationDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleDeleteConfirm}
          message={`Are you sure you want to delete test plan "${toDeleteTestPlan?.name}"?`}
      />
    </div>
  );
};

export default TestPlanListPage;
