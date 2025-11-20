/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createJobPosition = /* GraphQL */ `
  mutation MyQuery($jobPosition: JobPositionCreateInput!) {
    createJobPosition(jobPosition: $jobPosition)
  }
`;

export const getAllJobPositions = /* GraphQL */ `
  query MyQuery($organizationID: String!) {
    getAllJobPositions(organizationID: $organizationID) {
      creator {
        id
        email
        firstName
      }
      department {
        id
        name
      }
      description
      id
      nmbOfPosition
      title
      status {
        name
        id
      }
    }
    getAllJobStatus {
      id
      name
    }
    getAllRecruiters {
      agreement
      company
      id
      userId {
        firstName
        lastName
        email
        contact_number
      }
    }
    getAllDepartments {
      id
      name
      description
      manager {
        id
        email
        firstName
      }
    }
  }
`;

export const getJobPositionDetails = /* GraphQL */ `
  query MyQuery {
    getAllJobStatus {
      id
      name
    }
    getAllRecruiters {
      agreement
      company
      id
      userId {
        firstName
        lastName
        email
        contact_number
      }
    }
    getAllDepartments {
      id
      name
      description
      manager {
        id
        email
        firstName
      }
    }
  }
`;
