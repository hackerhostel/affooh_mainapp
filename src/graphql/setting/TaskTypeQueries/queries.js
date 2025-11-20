/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTaskType = /* GraphQL */ `
  mutation MyQuery($taskType: TaskTypeCreateInput!) {
    createTaskType(taskType: $taskType)
  }
`;

export const updateTaskType = /* GraphQL */ `
  mutation MyQuery($taskTypeUpdate: TaskTypeUpdateInput!) {
    updateTaskType(taskTypeUpdate: $taskTypeUpdate)
  }
`;

export const getTaskTypesByOrganization = /* GraphQL */ `
  query MyQuery {
    listTaskTypesByOrganization {
      description
      id
      name
      projects {
        id
        name
      }
      screen {
        id
        name
      }
    }
  }
`;

export const getTaskTypesByProject = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listTaskTypesByProject(projectID: $projectID) {
      description
      id
      name
      projects {
        id
        name
      }
      screen {
        id
        name
      }
    }
  }
`;

export const deleteTaskType = /* GraphQL */ `
  mutation MyQuery($taskTypeID: Int!) {
    deleteTaskType(taskTypeID: $taskTypeID)
  }
`;
