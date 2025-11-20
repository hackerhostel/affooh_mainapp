/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getDetailsForDashboard = /* GraphQL */ `
  query MyQuery {
    getDetailsForDashboard {
      avatar
      organization {
        avatar
        description
        id
        licenseType
        name
      }
      updatedAt
      lastName
      id
      firstName
      email
      createdAt
      contactNumber
      userRole {
        description
        id
        name
      }
    }
  }
`;

export const getUserInviteFormConstants = /* GraphQL */ `
  query MyQuery {
    getUserInviteFormConstants {
      id
      value
    }
  }
`;

export const listUsersByOrganization = /* GraphQL */ `
  query MyQuery {
    listUsersByOrganization {
      id
      firstName
      lastName
      email
      contactNumber
      createdAt
      userRole
    }
  }
`;

export const createOrganizationInvite = /* GraphQL */ `
  mutation MyQuery($userInvite: SystemInviteCreateInput!) {
    createOrganizationInvite(userInvite: $userInvite)
  }
`;

export const listUserInvitesByOrganization = /* GraphQL */ `
  query MyQuery {
    listUserInvitesByOrganization {
      accepted
      id
      email
      deleted
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
    }
  }
`;

export const deleteUser = /* GraphQL */ `
  mutation MyQuery($userID: Int!) {
    deleteUser(userID: $userID)
  }
`;

export const getUser = /* GraphQL */ `
  query MyQuery($userID: Int!) {
    getUser(userID: $userID) {
      address
      contactNumber
      email
      firstName
      id
      avatar
      role {
        id
        name
        createdAt
        createdBy {
          avatar
          contactNumber
          email
          firstName
          id
          lastName
        }
        description
        isDefault
      }
      createdAt
      designation {
        id
        name
      }
      language
      lastName
      reportingManager {
        avatar
        contactNumber
        email
        firstName
        id
        lastName
      }
      startOfCalendarWeek
      timezone
      type {
        name
        id
      }
      updatedAt
    }
  }
`;

export const updateUserDetails = /* GraphQL */ `
  mutation MyQuery($updatedUserDetails: UserUpdateInput!) {
    updateUserDetails(updatedUserDetails: $updatedUserDetails)
  }
`;
