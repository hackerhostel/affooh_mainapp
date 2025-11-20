/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listTestExecutionOptions = /* GraphQL */ `
  query MyQuery {
    listTestExecutionOptions {
      cycles {
        id
        name
      }
      id
      summary
    }
  }
`;

export const getTestExecutionData = /* GraphQL */ `
    query MyQuery ($testCycleID: Int!, $testSuiteID: Int!){
        getTestExecutionData(testCycleID: $testCycleID, testSuiteID: $testSuiteID) {
            assignee
            status
            summary
            steps {
                description
                expectedOutcome
                id
                inputData
                notes
            }
            priority
            platform
            category
            notes
            testCycleExecutionID
        }
    }
`;

export const updateTestExecution = /* GraphQL */ `
    mutation MyQuery($updatedTestExecution: TestExecutionUpdateInput!) {
        updateTestExecution(updatedTestExecution: $updatedTestExecution)
    }
`;
