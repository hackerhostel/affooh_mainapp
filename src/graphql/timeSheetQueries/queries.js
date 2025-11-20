export const getTimeSheetReportData = /* GraphQL */ `
  query MyQuery {
    getTimeSheetReportData(reportFilters: {}) {
      detailedTimeLogsSummary {
        assigned
        date
        description
        status
        taskID
        taskKey
        timeSpent
        title
      }
      timeLogsDaily {
        fullName
        timeLogSummaryDaily {
          date
          timeSpent
        }
      }
    }
  }
`;

export const getTaskDetailedReportData = /* GraphQL */ `
  query MyQuery {
    getTaskDetailedReportData(reportFilters: {}) {
      tasks {
        assignee
        createdDate
        endDate
        estimate
        priority
        reporter
        startDate
        status
        taskID
        taskKey
        taskType
        title
      }
    }
  }
`;

export const getFiltersForReports = /* GraphQL */ `
  query MyQuery {
  getFiltersForReports(filterTypes: {projects: true, users: true, priorities: true, statuses: true, taskTypes: true}) {
    projects {
      id
      value
    }
    users {
      id
      value
    }
    statuses {
      id
      value
    }
    taskTypes {
      id
      value
    }
    completedSprints {
      id
    }
    priorities {
      id
      value
    }
  }
}
`;


export const getSprintReportData = /* GraphQL */ `
 query MyQuery {
  getSprintReportData(sprintID: 10) {
    addedTasks {
      assignee
      createdDate
      endDate
      estimate
      priority
      reporter
      startDate
      status
      taskID
      taskKey
      taskType
      title
    }
    completedTasks {
      assignee
      createdDate
      endDate
      estimate
      priority
      reporter
      startDate
      status
      taskID
      taskKey
      taskType
      title
    }
    notCompletedTasks {
      assignee
      createdDate
      endDate
      estimate
      priority
      reporter
      startDate
      status
      taskID
      taskKey
      taskType
      title
    }
    removedTasks {
      assignee
      createdDate
      endDate
      estimate
      priority
      reporter
      startDate
      status
      taskID
      taskKey
      taskType
      title
    }
  }
}

`;








