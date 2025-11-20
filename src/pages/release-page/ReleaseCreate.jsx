import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon } from "@heroicons/react/24/outline";
import FormInput from "../../components/FormInput.jsx";
import FormSelect from "../../components/FormSelect.jsx";
import FormTextArea from "../../components/FormTextArea.jsx";
import {
  doSwitchProject,
  selectProjectList,
  selectSelectedProject,
} from "../../state/slice/projectSlice.js";
import useValidation from "../../utils/use-validation.jsx";
import { ReleaseCreateSchema } from "../../utils/validationSchemas.js";
import { useToasts } from "react-toast-notifications";
import axios from "axios";
import { selectTestCaseStatuses } from "../../state/slice/testCaseFormDataSlice.js";
import { getSelectOptions } from "../../utils/commonUtils.js";
import { doGetReleases } from "../../state/slice/releaseSlice.js";

const ReleaseCreate = ({ isOpen, onClose }) => {
  const { addToast } = useToasts();
  const dispatch = useDispatch();
  const selectedProject = useSelector(selectSelectedProject);
  const projectList = useSelector(selectProjectList);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [releaseTypes, setReleaseTypes] = useState([]);
  const releaseStatus = [
    { value: "RELEASED", label: "RELEASED" },
    { value: "UNRELEASED", label: "UNRELEASED" },
  ];

  useEffect(() => {
    getReleaseTypes();
  }, []);

  const handleProjectChange = (name, value) => {
    handleFormChange(name, value);
    dispatch(doSwitchProject(value));
  };

  const handleFormChange = (name, value, isText) => {
    setFormValues({ ...formValues, [name]: isText ? value : Number(value) });
    setIsValidationErrorsShown(false);
  };

  const [isValidationErrorsShown, setIsValidationErrorsShown] = useState(false);
  const [formValues, setFormValues] = useState({
    name: "",
    releaseDate: "",
    type: 1,
    version: "",
    projectID: selectedProject?.id.toString() || 0,
    status: "UNRELEASED",
  });
  const [formErrors] = useValidation(ReleaseCreateSchema, formValues);

  const getReleaseTypes = async () => {
    await axios
      .get("releases/types")
      .then((r) => {
        setReleaseTypes(r?.data?.releaseType);
      })
      .catch((e) => {
        addToast("Failed To Get Release Types", { appearance: "error" });
      });
  };

  const getStatusLabel = (value) => {
    const status = releaseStatus.find((status) => status.value === value);
    return status?.label || "";
  };

  const createRelease = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (formErrors && Object.keys(formErrors).length > 0) {
      setIsValidationErrorsShown(true);
    } else {
      setIsValidationErrorsShown(false);

      try {
        const response = await axios.post("releases", {
          release: formValues,
        });

        const releaseId = response?.data?.body?.releaseId;

        if (true || releaseId > 0) {
          dispatch(doGetReleases(selectedProject?.id));
          onClose();
          addToast("Release Successfully Created", { appearance: "success" });
        } else {
          addToast("Failed To Create The Release", { appearance: "error" });
        }
      } catch (error) {
        addToast("Failed To Create The Release", { appearance: "error" });
      }
    }

    setIsSubmitting(false);
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-end z-[999">
        <div
          className="fixed top-[420px] right-0 transform -translate-y-1/2
  w-[797px] h-[840px] p-5 bg-white shadow-md 
  z-[1000] rounded-l-lg"
        >
          <button
            onClick={onClose}
            className="
  absolute top-2.5 right-2.5 bg-transparent border-none 
  text-[16px] cursor-pointer backdrop-blur-sm
"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
          <div className="p-2 ">
            <div className="text-3xl border-b border-gray-300/40 pb-2">
              New Release test
            </div>
            <form onSubmit={createRelease}>
              <div className=" mt-5">
                <FormInput
                  type="text"
                  name="name"
                  formValues={formValues}
                  placeholder="Name"
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value, true)
                  }
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>

              <div className="mt-5">
                <label className="block text-sm text-text-color">
                  Description
                </label>
                <FormTextArea
                  name="description"
                  showShadow={false}
                  formValues={formValues}
                  onChange={({ target: { name, value } }) =>
                    handleFormChange(name, value, true)
                  }
                  rows={6}
                  formErrors={formErrors}
                  showErrors={isValidationErrorsShown}
                />
              </div>

              <div className="flex w-full justify-between gap-10 mt-4">
                <div className="w-2/4">
                  <FormInput
                    type="date"
                    name="releaseDate"
                    formValues={formValues}
                    placeholder="Release Date"
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>

                {/* <div className="flex-col">
                  <FormSelect
                    name="status"
                    disabled={true}
                    placeholder="Status"
                    formValues={formValues}
                    options={releaseStatus}
                    formErrors={formErrors}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    showErrors={isValidationErrorsShown}
                  />
                </div> */}

                <div className="w-2/4">
                  <FormInput
                    type="text"
                    name="version"
                    formValues={formValues}
                    placeholder="Version"
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value, true)
                    }
                    formErrors={formErrors}
                    showErrors={isValidationErrorsShown}
                  />
                </div>
                <div className="w-2/4">
                  <FormSelect
                    name="type"
                    placeholder="Type"
                    formValues={formValues}
                    options={getSelectOptions(releaseTypes)}
                    formErrors={formErrors}
                    onChange={({ target: { name, value } }) =>
                      handleFormChange(name, value)
                    }
                    showErrors={isValidationErrorsShown}
                  />
                </div>
              </div>
              <div className="flex space-x-4 mt-44 self-end w-full">
                <button
                  onClick={onClose}
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
        </div>
      )}
    </>
  );
};

export default ReleaseCreate;
