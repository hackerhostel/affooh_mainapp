import {Tab, TabGroup, TabList, TabPanel, TabPanels} from '@headlessui/react'
import React from "react";
import ScreenTabField from "./ScreenTabField.jsx";

const TaskScreenDetails =
  ({
     taskFormData,
     handleFormChange,
     isValidationErrorsShown,
     screenDetails
   }) => {
    return (
      <div className="w-full">
        <TabGroup>
          <TabList className="flex gap-4 mt-5">
            {screenDetails?.tabs.map(({id, name}) => (
              <Tab
                key={id}
                className="rounded-full py-1 px-3 text-sm/6 font-semibold bg-gray-900 text-white focus:outline-none data-[selected]:bg-primary-pink data-[hover]:bg-secondary-grey data-[selected]:data-[hover]:bg-primary-pink data-[focus]:outline-1 data-[focus]:outline-white"
              >
                {name}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-5 rounded-md">
            {screenDetails?.tabs.map(({id, fields}) => (
              <TabPanel key={id} className="rounded-xl bg-white/5">
                <div className="grid grid-cols-3 gap-4">
                    {fields.filter((field) => {
                        return (
                            field.name !== "Task Owner" &&
                            field.name !== "Predecessors" &&
                            field.name !== "Labels"
                        );
                    }).map((field) => (
                    <ScreenTabField
                      field={field}
                      onChange={handleFormChange}
                      formValues={taskFormData}
                      isValidationErrorsShown={isValidationErrorsShown}
                    />
                  ))}
                </div>
              </TabPanel>
              ))}
          </TabPanels>
        </TabGroup>
      </div>
    )
  }

export default TaskScreenDetails;