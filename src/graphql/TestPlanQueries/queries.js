/* eslint-disable */

export const listTestPlansByProject = /* GraphQL */ `
    query MyQuery($projectID: Int!) {
        listTestPlansByProject (projectID: $projectID) {
            id
            name
            projectID
            releaseID
            sprintID
        }
    }
`;

export const getTestPlan = /* GraphQL */ `
    query MyQuery($testPlanID: Int!) {
        getTestPlan (testPlanID: $testPlanID) {
            id
            name
            projectID
            releaseID
            sprintID
            testSuites {
                description
                assignee
                id
                status
                summary
            }
        }
    }
`;


