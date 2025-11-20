/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createTask = /* GraphQL */ `
  mutation MyQuery($task: TaskCreateInput!) {
    createTask(task: $task)
  }
`;

export const listTasksBySprint = /* GraphQL */ `
  query MyQuery($sprintID: Int!) {
    listTasksBySprint(sprintID: $sprintID) {
      tasks {
        id
        code
        type
        attributes {
          endDate {
            attributeKey
            taskFieldID
            value
          }
          priority {
            attributeKey
            id
            taskFieldID
            value
          }
          severity {
            attributeKey
            id
            taskFieldID
            value
          }
          startDate {
            attributeKey
            taskFieldID
            value
          }
          status {
            attributeKey
            id
            taskFieldID
            value
          }
        }
        assignee {
          id
          lastName
          firstName
        }
        createdAt
        description
        hasParentTasks
        name
        parentTaskID
        timeLog {
          time
        }
      }
      priorities {
        colourCode
        id
        value
      }
      severities {
        colourCode
        id
        value
      }
      statuses {
        colourCode
        id
        value
      }
    }
  }
`;

export const getTask = /* GraphQL */ `
  query MyQuery($taskCode: String!) {
    getTaskByCode(taskCode: $taskCode) {
      assignee {
        id
        lastName
        firstName
      }
      attributes {
        fieldTypeName
        id
        taskFieldID
        taskFieldName
        values
      }
      createdAt
      createdBy {
        id
        lastName
        firstName
      }
      description
      id
      name
      code
      epicID
      attachments {
        fileFormat
        fileKey
        fileName
        fileSize
        id
      }
      acceptedCriteria {
        acId
        description
        status
      }
      tasksTaskList {
        taskListID
        name
      }
      project {
        id
        name
      }
      sprint {
        id
        name
      }
      screen {
        description
        id
        name
        tabs {
          id
          name
          fields {
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
      }
      subTasks {
        id
        code
        name
        assignee {
          id
          firstName
          lastName
        }
        taskType {
          id
          name
        }
        attributes {
          priority {
            id
            value
          }
          status {
            value
            id
          }
        }
      }
      taskType {
        id
        name
      }
      linkedTasks {
        id
        linkID
        linkType {
          id
          name
        }
        code
        name
        attributes {
          status {
            value
            id
          }
        }
        assignee {
          id
          firstName
          lastName
        }
      }
      testCases {
        summary
        testCaseID
        priority {
          id
          value
        }
        category {
          id
          value
        }
      }
    }
    getTaskLinkTypes {
      id
      name
    }
  }
`;

export const getTaskDetails = /* GraphQL */ `
  query MyQuery($taskID: Int!, $projectID: Int!) {
    listCommentsByTask(taskID: $taskID) {
      comment
      createdAt
      id
      createdBy {
        id
        firstName
        lastName
      }
      createdAt
      mentions {
        id
        name
        type
      }
      replies {
        comment
        id
        createdAt
        taskID
        mentions {
          id
          name
          type
        }
        createdBy {
          id
          firstName
          lastName
        }
        createdAt
      }
      taskID
    }
    getTimeLogsByTask(taskID: $taskID) {
      createdAt
      date
      id
      time
      user {
        id
        lastName
        firstName
      }
      description
    }
    listUsersByProject(projectID: $projectID) {
      id
      firstName
      lastName
    }
    listTasksByProject(projectID: $projectID) {
      id
      name
      code
      type
    }
    listTaskListsByProject(projectID: $projectID) {
      id
      name
      tasks {
        name
        id
        taskType {
          id
          name
        }
      }
    }
    getProject(projectID: $projectID) {
      id
      name
      deletedAt
      deleted
      createdBy {
        id
        lastName
        firstName
      }
      colorTheme
      createdAt
      avatar
    }
  }
`;

export const updateTask = /* GraphQL */ `
  mutation MyQuery($taskUpdateAttribute: TaskUpdateInput!) {
    updateTask(taskUpdateAttribute: $taskUpdateAttribute) {
      assignee {
        id
        lastName
        firstName
      }
      attributes {
        fieldTypeName
        id
        taskFieldID
        taskFieldName
        values
      }
      createdAt
      createdBy {
        id
        lastName
        firstName
      }
      description
      id
      name
      epicID
      project {
        id
        name
      }
      sprint {
        id
        name
      }
      screen {
        description
        id
        name
        tabs {
          id
          name
          fields {
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
      }
      subTasks {
        id
        name
      }
      taskType {
        id
        name
      }
      linkedTasks {
        id
        linkType {
          id
          name
        }
        name
      }
    }
  }
`;

export const createTaskComment = /* GraphQL */ `
  mutation MyQuery($comment: TaskCommentCreateInput!) {
    createCommentOnTask(comment: $comment)
  }
`;

export const updateTaskComment = /* GraphQL */ `
  mutation MyQuery($newComment: TaskCommentUpdateInput!) {
    updateCommentOnTask(newComment: $newComment)
  }
`;

export const deleteTaskComment = /* GraphQL */ `
  mutation MyQuery($commentID: Int!) {
    deleteComment(commentID: $commentID)
  }
`;

export const getTaskComments = /* GraphQL */ `
  query MyQuery($taskID: Int!) {
    listCommentsByTask(taskID: $taskID) {
      comment
      createdAt
      id
      createdBy {
        id
        firstName
        lastName
      }
      createdAt
      mentions {
        id
        name
        type
      }
      replies {
        comment
        id
        createdAt
        taskID
        mentions {
          id
          name
          type
        }
        createdBy {
          id
          firstName
          lastName
        }
        createdAt
      }
      taskID
    }
  }
`;

export const getTaskDetailsByProjectId = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listUsersByProject(projectID: $projectID) {
      id
      firstName
      lastName
    }
    listTasksByProjectMinimal(projectID: $projectID) {
      id
      name
      code
      type
    }
  }
`;

export const getTasksByProject = /* GraphQL */ `
  query MyQuery($projectID: Int!) {
    listTasksByProjectMinimal(projectID: $projectID) {
      id
      name
      code
      type
    }
  }
`;

export const createTaskLogTime = /* GraphQL */ `
  mutation MyQuery($taskTime: LogTimeInput!) {
    logTime(taskTime: $taskTime)
  }
`;

export const getTaskLogTimeByTask = /* GraphQL */ `
  query MyQuery($taskID: Int!) {
    getTimeLogsByTask(taskID: $taskID) {
      createdAt
      date
      id
      time
      user {
        id
        lastName
        firstName
      }
      description
    }
  }
`;

export const updateTaskLogTime = /* GraphQL */ `
  mutation MyQuery($updatedTimeLog: TimeLogUpdateInput!) {
    updateLoggedTime(updatedTimeLog: $updatedTimeLog)
  }
`;

export const deleteTaskLogTime = /* GraphQL */ `
  mutation MyQuery($timeLogID: Int!) {
    deleteLoggedTime(timeLogID: $timeLogID)
  }
`;

export const createSubTask = /* GraphQL */ `
  mutation MyQuery($subTask: SubTaskCreateInput!) {
    createSubTask(subTask: $subTask)
  }
`;

export const createTaskLink = /* GraphQL */ `
  mutation MyQuery($taskLink: TaskLinkCreateInput!) {
    linkTasks(taskLink: $taskLink)
  }
`;

export const deleteTaskLink = /* GraphQL */ `
  mutation MyQuery($taskLinkID: Int!) {
    deleteTaskLink(taskLinkID: $taskLinkID)
  }
`;

export const getTaskLinks = /* GraphQL */ `
  query MyQuery($taskID: Int!) {
    getTask(taskID: $taskID) {
      linkedTasks {
        id
        linkID
        linkType {
          id
          name
        }
        name
        attributes {
          status {
            value
            id
          }
        }
        assignee {
          id
          firstName
          lastName
        }
      }
    }
  }
`;

export const getSubTasks = /* GraphQL */ `
  query MyQuery($taskID: Int!) {
    getTask(taskID: $taskID) {
      subTasks {
        id
        code
        name
        assignee {
          id
          firstName
          lastName
        }
        taskType {
          id
          name
        }
        attributes {
          priority {
            id
            value
          }
          status {
            value
            id
          }
        }
      }
    }
  }
`;

export const changeTaskSprint = /* GraphQL */ `
  mutation MyQuery($taskID: Int!, $sprintID: Int!) {
    changeTaskSprint(taskID: $taskID, sprintID: $sprintID)
  }
`;

export const updateTasksTaskList = /* GraphQL */ `
  mutation MyQuery($taskListInput: TaskListOfTaskUpdateInput!) {
    updateTasksTaskList(taskListInput: $taskListInput)
  }
`;

export const createTaskAttachment = /* GraphQL */ `
  mutation MyQuery($taskAttachment: OwnTaskAttachmentCreateInput!) {
    createTaskAttachment(taskAttachment: $taskAttachment) {
      fileFormat
      fileKey
      fileName
      fileSize
      id
    }
  }
`;

export const deleteTaskAttachment = /* GraphQL */ `
  mutation MyQuery($taskAttachmentID: Int!) {
    deleteTaskAttachment(taskAttachmentID: $taskAttachmentID)
  }
`;

export const manageAcceptedCriteria = /* GraphQL */ `
  mutation MyQuery($acceptedCriteria: AcceptedCriteriaInput!) {
    manageAcceptedCriteria(acceptedCriteria: $acceptedCriteria)
  }
`;

export const deleteTask = /* GraphQL */ `
  mutation MyQuery($taskID: Int!) {
    deleteTask(taskID: $taskID)
  }
`;

export const cloneTask = /* GraphQL */ `
  mutation MyQuery($taskID: Int!, $taskName: String!) {
    cloneTask(taskID: $taskID, taskName: $taskName)
  }
`;

export const onDeleteTask = /* GraphQL */ `
  subscription MyQuery {
    onDeleteTask
  }
`;

export const onUpdateTask = /* GraphQL */ `
  subscription MyQuery {
    onUpdateTask {
      id
      sprint {
        id
      }
    }
  }
`;

export const convertToSubTask = /* GraphQL */ `
  mutation MyMutation($input: SubTaskConvertInput!) {
    convertSubTask(convertToSubTask: $input)
  }
`;

export const changeTaskProject = /* GraphQL */ `
  mutation MyMutation($input: TaskProjectChangeInput!) {
    changeTaskProject(changeProject: $input)
  }
`;