export const createTaskList = /* GraphQL */ `
  mutation MyQuery($taskList: TaskListCreateInput!) {
    createTaskList(taskList: $taskList)
  }
`;

export const getTaskListsByProject = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listTaskListsByProject(projectID: $projectID) {
      id
      name
      tasks {
        name
        id
        taskType {
          id
          name
        }
      }
    }
  }
`;

export const getTaskList = /* GraphQL */ `
    query MyQuery($taskListID: Int!) {
        getTaskList(taskListID: $taskListID) {
            id
            name
            priorities {
                colourCode
                id
                value
            }
            severities {
                colourCode
                id
                value
            }
            statuses {
                colourCode
                id
                value
            }
            tasks {
                taskType {
                    id
                    name
                }
                assignee {
                    avatar
                    contactNumber
                    createdAt
                    email
                    firstName
                    id
                    lastName
                    updatedAt
                }
                attributes {
                    endDate {
                        attributeKey
                        taskFieldID
                        value
                    }
                    priority {
                        attributeKey
                        id
                        taskFieldID
                        value
                    }
                    severity {
                        attributeKey
                        id
                        taskFieldID
                        value
                    }
                    startDate {
                        attributeKey
                        taskFieldID
                        value
                    }
                    status {
                        attributeKey
                        id
                        taskFieldID
                        value
                    }
                }
                code
                description
                hasChildTasks
                hasParentTasks
                id
                name
                parentTaskID
                type
            }
            displayConfig {
                dataField
                index
            }
        }
    }
`;

export const updateTaskListDisplayConfig = /* GraphQL */ `
    mutation MyQuery($displayConfig: [DisplayConfigCreateInput!]!, $taskListID: Int!) {
        updateTaskListDisplayConfig(displayConfig: $displayConfig, taskListID: $taskListID)
    }
`;

export const deleteTaskList = /* GraphQL */ `
    mutation MyQuery($taskListID: Int!) {
        deleteTaskList(taskListID: $taskListID)
    }
`;
