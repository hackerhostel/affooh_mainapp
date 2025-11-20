/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const listUserInvitesByOrganization = /* GraphQL */ `
  query MyQuery {
    listUserInvitesByOrganization {
      id
      accepted
      deleted
      email
      invitedAt
      invitedBy {
        id
        firstName
        email
      }
      organization {
        id
        name
      }
      userRole {
        id
        name
      }
    }
  }
`;

/**
 * @deprecated since version 2.0
 */
export const getProjectBreakdown = /* GraphQL */ `
    query MyQuery($defaultProject: String) {
        getProjectBreakdownV2(defaultProject: $defaultProject) {
            id
            organizationName
            defaultProject {
                id
                name
            }
            projects {
                id
                name
                prefix
                projectType
            }
        }
    }
`;
