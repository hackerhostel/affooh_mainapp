/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createRelease = /* GraphQL */ `
  mutation MyQuery($release: ReleaseCreateInput!) {
    createRelease(release: $release)
  }
`;

export const updateRelease = /* GraphQL */ `
  mutation MyQuery($updatedRelease: ReleaseUpdateInput!) {
    updateRelease(updatedRelease: $updatedRelease)
  }
`;

export const deleteRelease = /* GraphQL */ `
  mutation MyQuery($releaseID: Int!) {
    deleteRelease(releaseID: $releaseID)
  }
`;

export const listReleasesByProject = /* GraphQL */ `
    query MyQuery($projectID: Int!) {
        listReleasesByProject (projectID: $projectID) {
            id
            name
            releaseDate
            status
            type {
                id
                name
            }
            version
        }
    }
`;

export const listReleaseAttributes = /* GraphQL */ `
  query MyQuery {
    listProjectsByOrganization {
      id
      name
    }
    getReleaseCreateFormData {
      statuses
      types {
        id
        name
      }
    }
  }
`;

export const listChecklistsByProjects = /* GraphQL */ `
  query MyQuery($projectIDs: [Int]!) {
    listChecklistsByProjects(projectIDs: $projectIDs) {
      name
      id
      description
      items {
        description
        id
        name
      }
    }
  }
`;

export const createChecklist = /* GraphQL */ `
  mutation MyQuery($checklist: ChecklistCreateInput!) {
    createChecklist(checklist: $checklist)
  }
`;

export const getRelease = /* GraphQL */ `
  query MyQuery($releaseID: Int!) {
    getRelease(releaseID: $releaseID) {
      checklist {
        description
        id
        items {
          assignee {
            avatar
            firstName
            id
            lastName
          }
          id
          status
          summary
        }
        name
      }
      description
      id
      name
      projects {
        id
        name
      }
      releaseDate
      status
      tasks {
        assignee
        id
        name
        status
      }
      version
      type {
        id
        name
      }
      testSuites {
        assignee
        id
        status
        summary
      }
    }
  }
`;

export const updateChecklistItem = /* GraphQL */ `
    mutation MyQuery($updatedChecklistItem: ReleaseChecklistItemUpdateInput!) {
        updateChecklistItem(updatedChecklistItem: $updatedChecklistItem)
    }
`;
