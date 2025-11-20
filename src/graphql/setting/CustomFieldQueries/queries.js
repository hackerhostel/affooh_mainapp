/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createCustomField = /* GraphQL */ `
  mutation MyQuery($customField: CustomFieldCreateInput!) {
    createCustomField(customField: $customField)
  }
`;

export const getAllFieldTypes = /* GraphQL */ `
  query MyQuery{
    getFieldTypes{
      id
      name
      hasMultiValues
      canSelectMultiValues
      referencesTable
    }
  }
`;

export const getAllCustomFields = /* GraphQL */ `
  query MyQuery($excludeGeneralFields: Boolean) {
    getCustomFieldsForOrganization(
      excludeGeneralFields: $excludeGeneralFields
    ) {
      id
      name
      fieldType {
        id
        name
      }
    }
  }
`;

export const deleteCustomField = /* GraphQL */ `
    mutation MyQuery($customFieldID: Int!) {
        deleteCustomField(customFieldID: $customFieldID)
    }
`;
