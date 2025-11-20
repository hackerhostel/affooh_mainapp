/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createScreen = /* GraphQL */ `
  mutation MyQuery($screen: ScreenCreateInput!) {
    createScreen(screen: $screen)
  }
`;

export const updateScreen = /* GraphQL */ `
  mutation MyQuery($updateScreen: ScreenUpdateInput!) {
    updateScreen(updateScreen: $updateScreen)
  }
`;

export const deleteScreen = /* GraphQL */ `
  mutation MyQuery($screenID: Int!) {
    deleteScreens(screenID: $screenID)
  }
`;

export const getAllScreens = /* GraphQL */ `
  query MyQuery {
    listScreensByOrganization {
      id
      name
      description
      taskTypes {
        name
        id
      }
      projects {
        id
        name
      }
    }
    getGeneralTabFields {
      name
      required
    }
  }
`;

export const getScreensByProject = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listScreensByProject(projectID: $projectID) {
      id
      name
      projects {
        id
        name
      }
      taskTypes {
        id
        name
      }
    }
  }
`;


export const getScreen = /* GraphQL */ `
  query MyQuery($screenID: Int!, $projectID: Int!) {
    getScreen(projectID: $projectID, screenID: $screenID) {
      description
      id
      name
      projects {
        id
        name
      }
      tabs {
        id
        name
        fields {
          description
          id
          name
          required
          fieldType {
            canSelectMultiValues
            hasMultiValues
            id
            name
            referencesTable
          }
          fieldValues {
            colourCode
            id
            value
          }
        }
      }
      taskTypes {
        id
        name
      }
    }
  }
`;

export const getTabsByScreen = /* GraphQL */ `
  query MyQuery($screenID: Int!) {
    listTabsByScreen(screenID: $screenID) {
      id
      name
      fields {
        id
        name
        required
      }
    }
  }
`;

export const getScreenGeneralTab = /* GraphQL */ `
  query MyQuery {
    getGeneralTabFields {
      name
      required
    }
  }
`;
