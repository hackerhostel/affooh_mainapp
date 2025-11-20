/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTestsuite = /* GraphQL */ `
  mutation MyQuery($testSuite: TestSuiteCreateInput!) {
    createTestSuite(testSuite: $testSuite)
  }
`;

export const getTestSuiteCreateFormData = /* GraphQL */ `
  query MyQuery ($projectID: Int!) {
    getTestSuiteCreateFormData (projectID: $projectID) {
      platforms {
        id
        name
      }
      releases {
        id
        name
      }
      testCases {
        id
        summary
      }
      statuses {
        id
        value
      }
    }
    listUsersByOrganization {
      id
      firstName
      lastName
      email
    }
  }
`;

export const listTestSuitesByProject = /* GraphQL */ `
    query MyQuery($projectID: Int!) {
        listTestSuitesByProject (projectID: $projectID) {
            id
            summary
            status {
                id
                type
                value
            }
            createdAt
            description
            createdBy {
                id
                lastName
                firstName
            }
        }
    }
`;

export const getTestSuite = /* GraphQL */ `
  query MyQuery($testSuiteID: Int!) {
    getTestSuite(testSuiteID: $testSuiteID) {
      testSuite {
        description
        id
        platforms {
          id
          name
        }
        releases {
          id
          name
        }
        status {
          id
          type
          value
        }
        summary
        assignee {
          id
        }
        testCases {
          id
          summary
        }
        testCycles {
          id
          name
          build
        }
      }
    }
  }
`;

export const updateTestSuite = /* GraphQL */ `
  mutation MyQuery($updatedTestSuite: TestSuiteUpdateInput!) {
    updateTestSuite(updatedTestSuite: $updatedTestSuite)
  }
`;

export const deleteTestSuite = /* GraphQL */ `
  mutation MyQuery($testSuiteID: Int!) {
    deleteTestSuite(testSuiteID: $testSuiteID)
  }
`;
