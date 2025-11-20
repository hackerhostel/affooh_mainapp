/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUserNotifications = /* GraphQL */ `
    query MyQuery($userId: Int!) {
        getUserNotifications(userId: $userId) {
            id
            userId
            firstName
            lastName
            email
            notificationTypeId
            notificationTypeName
            notificationTypeCode
            notificationCategoryId
            notificationCategory
            notificationCategoryCode
            message
            title
            metadata
            createdDate
            sendEmail
            sendPush
            read
            view
            delete
        }
    }
`;
