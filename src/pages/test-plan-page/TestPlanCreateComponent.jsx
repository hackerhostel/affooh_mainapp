import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline/index.js";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import { getSelectOptions } from "../../utils/commonUtils.js";
import { useDispatch, useSelector } from "react-redux";
import { selectSprintListForProject } from "../../state/slice/sprintSlice.js";
import useValidation from "../../utils/use-validation.jsx";
import {
  selectProjectList,
  selectSelectedProject,
} from "../../state/slice/projectSlice.js";
import {
  doGetReleases,
  selectReleaseListForProject,
} from "../../state/slice/releaseSlice.js";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import { TestPlanCreateSchema } from "../../utils/validationSchemas.js";
import { doGetTestPlans } from "../../state/slice/testPlansSlice.js";

const TestPlanCreateComponent = ({ isOpen, onClose }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();

  const sprintListForProject = useSelector(selectSprintListForProject);
  const projects = useSelector(selectProjectList);
  const releases = useSelector(selectReleaseListForProject);
  const selectedProject = useSelector(selectSelectedProject);

  const [project, setProject] = useState(selectedProject);
  const [formValues, setFormValues] = useState({
    name: "",
    sprintId: "",
    projectId: project?.id,
    releaseId: "",
    status: "TODO",
  });
  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors] = useValidation(TestPlanCreateSchema, formValues);
  const testPlanStatus = [
    { value: "TODO", label: "TODO" },
    { value: "IN PROGRESS", label: "IN PROGRESS" },
    { value: "DONE", label: "DONE" },
  ];

  useEffect(() => {
    if (selectedProject?.id) {
      setProject(selectedProject);
      setFormValues({ ...formValues, projectId: selectedProject.id });
    }
    if (selectedProject?.id && !releases.length) {
      dispatch(doGetReleases(selectedProject?.id));
    }
  }, [selectedProject]);

  const handleFormChange = (name, value, isText) => {
    setFormValues({ ...formValues, [name]: isText ? value : Number(value) });
    setIsValidationErrorsShown(false);
  };

  const handleClose = () => {
    onClose();
    setFormValues({
      name: "",
      sprintId: "",
      projectId: project.id,
      releaseId: "",
      status: "TODO",
    });
    setIsValidationErrorsShown(false);
  };

  const createTestPlan = async (event) => {
    setIsSubmitting(true);
    event.preventDefault();

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
    } else {
      setIsValidationErrorsShown(false);
      try {
        const response = await axios.post("/test-plans", { task: formValues });
        const testPlanId = response?.data?.testPlanId;

        if (testPlanId > 0) {
          addToast("Test Plan Successfully Created", { appearance: "success" });
          dispatch(doGetTestPlans(project?.id));
          handleClose();
        } else {
          addToast("Failed To Create The Test Plan ", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed To Create The Test Plan ", { appearance: "error" });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-right justify-end bg-white bg-opacity-25 backdrop-blur-sm">
          <div className="bg-white p-6 shadow-lg w-2/4">
            <div className="flex justify-between items-center mb-4">
              <p className="font-bold text-2xl">New Test Plan</p>
              <div className={"cursor-pointer"} onClick={handleClose}>
                <XMarkIcon className={"w-6 h-6 text-gray-500"} />
              </div>
            </div>
            <form
              className={"flex flex-col justify-between h-5/6 mt-10"}
              onSubmit={createTestPlan}
            >
              <div className="space-y-4">
                <div className={"flex-col"}>
                  <p className={"text-secondary-grey"}>Name</p>
                  <FormInput
                    type="text"
                    name="name"
                    formValues={formValues}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className={"flex-col"}>
                  <p className={"text-secondary-grey"}>Project</p>
                  <FormSelect
                    name="projectId"
                    formValues={formValues}
                    options={
                      projects && projects.length
                        ? getSelectOptions(projects)
                        : []
                    }
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, false)
                    }
                    disabled={true}
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className={"flex-col"}>
                  <p className={"text-secondary-grey"}>Sprint</p>
                  <FormSelect
                    name="sprintId"
                    formValues={formValues}
                    options={
                      sprintListForProject && sprintListForProject.length
                        ? getSelectOptions(sprintListForProject)
                        : []
                    }
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, false)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className={"flex-col"}>
                  <p className={"text-secondary-grey"}>Release</p>
                  <FormSelect
                    name="releaseId"
                    formValues={formValues}
                    options={
                      releases && releases.length
                        ? getSelectOptions(releases)
                        : []
                    }
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, false)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className={"flex-col"}>
                  <p className={"text-secondary-grey"}>Status</p>
                  <FormSelect
                    name="status"
                    formValues={formValues}
                    options={testPlanStatus}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
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
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TestPlanCreateComponent;
