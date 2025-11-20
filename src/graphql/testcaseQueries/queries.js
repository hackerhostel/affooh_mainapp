/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTestcase = /* GraphQL */ `
  mutation MyQuery($testCase: TestCaseCreateInput!) {
    createTestCase(testCase: $testCase)
  }
`;

export const updateTestCase = /* GraphQL */ `
  mutation MyQuery($updatedTestCase: TestCaseUpdateInput!) {
    updateTestCase(updatedTestCase: $updatedTestCase)
  }
`;

export const getTestCaseFormData = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    getTestCaseFormData(projectID: $projectID) {
      attributes {
        id
        type
        value
      }
    }
  }
`;

export const getTestCases = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listTestCasesByProject(projectID: $projectID) {
      category {
        id
        value
        type
      }
      createdAt
      createdBy {
        id
        lastName
        firstName
      }
      id
      priority {
        id
        value
        type
      }
      status {
        id
        type
        value
      }
      summary
    }
  }
`;

export const getTestCase = /* GraphQL */ `
  query MyQuery($testCaseID: Int!) {
    getTestCase(testCaseID: $testCaseID) {
      id
      description
      estimate
      steps {
        description
        expectedOutcome
        id
        inputData
        notes
      }
      summary
      labels {
        colourCode
        id
        testCaseLabelID
        value
      }
      priority {
        id
        type
        value
      }
      requirements {
        id
        task {
          id
          name
        }
      }
      status {
        id
        type
        value
      }
      category {
        id
        type
        value
      }
      assignee {
        id
      }
    }
  }
`;

export const deleteTestCase = /* GraphQL */ `
  mutation MyQuery($testCaseID: Int!) {
    deleteTestCase(testCaseID: $testCaseID)
  }
`;
