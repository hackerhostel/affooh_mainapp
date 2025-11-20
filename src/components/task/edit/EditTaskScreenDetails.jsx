import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import React from "react";
import EditScreenTabField from "./EditScreenTabField.jsx";

const EditTaskScreenDetails = ({
  isEditing,
  initialTaskData,
  handleFormChange,
  isValidationErrorsShown,
  screenDetails,
  updateTaskAttribute,
  users,
  taskAttributes
}) => {

    const handleLabelSelect = (selectedId) => {
        const selectedLabel = field.fieldValues.find((label) => label.id === selectedId);
        if (selectedLabel) {
          onChange(tabName, field.name, selectedLabel);
        }
      };
    
  return (
    <div className="w-full bg-white rounded-md">
      <TabGroup>
        <TabPanels className="mt-5 p-5 rounded-sm">
          {screenDetails?.tabs.map(({ id, name, fields }) => {
            return (
              <TabPanel key={id} className="rounded-xl bg-white/5">
                <div className="gap-4">
                  {name === "General" && (
                    <>
                      {/* Status */}
                      {fields.find((field) => field.name === "Status") && (
                        <EditScreenTabField
                          isEditing={isEditing}
                          field={fields.find((field) => field.name === "Status")}
                          onChange={handleFormChange}
                          isValidationErrorsShown={isValidationErrorsShown}
                          updateTaskAttribute={updateTaskAttribute}
                          tabName={name}
                          users={users}
                          taskAttributes={taskAttributes}
                          initialAttributeData={initialTaskData?.attributes}
                        />
                      )}

                      {/* Priority */}
                      {fields.find((field) => field.name === "Priority") && (
                        <EditScreenTabField
                          isEditing={isEditing}
                          field={fields.find((field) => field.name === "Priority")}
                          onChange={handleFormChange}
                          isValidationErrorsShown={isValidationErrorsShown}
                          updateTaskAttribute={updateTaskAttribute}
                          tabName={name}
                           users={users}
                          taskAttributes={taskAttributes}
                          initialAttributeData={initialTaskData?.attributes}
                        />
                      )}

                      {/* Start Date and End Date */}
                      <div className="flex gap-4">
                        {fields.find((field) => field.name === "Start Date") && (
                          <div className="flex-1">
                            <EditScreenTabField
                              isEditing={isEditing}
                              field={fields.find((field) => field.name === "Start Date")}
                              onChange={handleFormChange}
                              isValidationErrorsShown={isValidationErrorsShown}
                              updateTaskAttribute={updateTaskAttribute}
                              tabName={name}
                              users={users}
                              taskAttributes={taskAttributes}
                              initialAttributeData={initialTaskData?.attributes}
                            />
                          </div>
                        )}
                        {fields.find((field) => field.name === "End Date") && (
                          <div className="flex-1">
                            <EditScreenTabField
                              isEditing={isEditing}
                              field={fields.find((field) => field.name === "End Date")}
                              onChange={handleFormChange}
                              isValidationErrorsShown={isValidationErrorsShown}
                              updateTaskAttribute={updateTaskAttribute}
                              tabName={name}
                              users={users}
                              taskAttributes={taskAttributes}
                              initialAttributeData={initialTaskData?.attributes}
                            />
                          </div>
                        )}
                      </div>

                      {/* Release */}
                      {fields.find((field) => field.name === "Release") && (
                        <EditScreenTabField
                          isEditing={isEditing}
                          field={fields.find((field) => field.name === "Release")}
                          onChange={handleFormChange}
                          isValidationErrorsShown={isValidationErrorsShown}
                          updateTaskAttribute={updateTaskAttribute}
                          tabName={name}
                          users={users}
                          taskAttributes={taskAttributes}
                          initialAttributeData={initialTaskData?.attributes}
                        />
                      )}

                      {/* Labels */}
                      {/* {fields.find((field) => field.name === "Labels") && (
                        <EditScreenTabField
                          isEditing={isEditing}
                          field={fields.find((field) => field.name === "Labels")}
                          onChange={handleFormChange}
                          isValidationErrorsShown={isValidationErrorsShown}
                          updateTaskAttribute={updateTaskAttribute}
                          tabName={name}
                          users={users}
                          taskAttributes={taskAttributes}
                          initialAttributeData={initialTaskData?.attributes}
                        />
                      )} */}
                    </>
                  )}
                </div>
              </TabPanel>
            );
          })}
        </TabPanels>
      </TabGroup>
    </div>
  );
};

export default EditTaskScreenDetails;
