/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProject = /* GraphQL */ `
  mutation MyQuery($project: ProjectCreateInput!) {
    createProject(project: $project)
  }
`;

export const updateProject = /* GraphQL */ `
    mutation MyQuery(
        $allCurrentProjectUserIDs: [Int]!
        $projectID: Int!
        $newProjectName: String
        $prefix: String
        $projectType: Int
    ) {
        updateProject(
            allCurrentProjectUserIDs: $allCurrentProjectUserIDs
            projectID: $projectID
            newProjectName: $newProjectName
            prefix: $prefix
            projectType: $projectType
        )
    }
`;

export const getProject = /* GraphQL */ `
    query MyQuery($projectID: Int!) {
        getProject(projectID: $projectID) {
            id
            name
            deletedAt
            deleted
            createdBy {
                id
                lastName
                firstName
            }
            colorTheme
            createdAt
            avatar
            prefix
            projectType {
                id
                name
            }
        }
        listUsersByProject(projectID: $projectID) {
            id
            lastName
            firstName
        }
    }
`;


export const createTaskDetailsOfProject = /* GraphQL */ `
    query MyQuery($projectID: Int!) {
        getProject(projectID: $projectID) {
            id
            name
            deletedAt
            deleted
            createdBy {
                id
                lastName
                firstName
            }
            colorTheme
            createdAt
            avatar
        }
        listUsersByProject(projectID: $projectID) {
            id
            lastName
            firstName
        }
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
        listTasksByProjectMinimal(projectID: $projectID) {
            id
            name
            type
        }
    }
`;

export const deleteProject = /* GraphQL */ `
  mutation MyQuery($projectID: Int!) {
    deleteProject(projectID: $projectID)
  }
`;

export const getProjectUsers = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listUsersByProject(projectID: $projectID) {
      id
      firstName
      lastName
      email
    }
  }
`;

export const checkPrefixValidity = /* GraphQL */ `
  query MyQuery($prefix: String!) {
    checkPrefixValidity(prefix: $prefix)
  }
`;

export const getProjectCreateFormData = /* GraphQL */ `
  query MyQuery {
    getProjectCreateFormData {
      types {
        id
        name
      }
      users {
        avatar
        id
        lastName
        firstName
      }
    }
  }
`;

export const onProjectUpdate = /* GraphQL */ `
    subscription MyQuery {
        onProjectUpdate
    }
`;

export const onProjectDelete = /* GraphQL */ `
    subscription MyQuery {
        onProjectDelete
    }
`;

