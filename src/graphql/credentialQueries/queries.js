/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCredential = /* GraphQL */ `
  mutation MyQuery($credential: CredentialCreateInput!) {
    createCredential(credential: $credential)
  }
`;

export const updateCredential = /* GraphQL */ `
  mutation MyQuery($credentialUpdate: CredentialUpdateInput!) {
    updateCredential(updatedCredential: $credentialUpdate)
  }
`;

export const getCredentials = /* GraphQL */ `
    query MyQuery {
        getAllCredentials {
            id
            name
            url
            userName
            password
            note
            users {
                id
                firstName
            }
        }
    }
`;

export const getCredentialsByOrganization = /* GraphQL */ `
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

export const getCredentialsByProject = /* GraphQL */ `
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

export const deleteCredential = /* GraphQL */ `
  mutation MyQuery($credentialID: Int!) {
    deleteTaskType(credentialID: $credentialID)
  }
`;
