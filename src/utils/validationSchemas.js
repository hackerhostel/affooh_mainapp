import * as yup from "yup";

export const TestPlanCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  sprintId: yup
    .number()
    .typeError("Sprint required")
    .required("Sprint required"),
  releaseId: yup
    .number()
    .typeError("Release required")
    .required("Release required"),
});

export const TestPlanEditSchema = yup.object({
  name: yup.string().required("Name is required"),
});

export const TestSuiteCreateSchema = yup.object().shape({
  summary: yup.string().required("Summary is required"),
  status: yup
    .number()
    .typeError("Status is required")
    .required("Status is required")
    .min(1, "Status is required"),
  assignee: yup
    .number()
    .typeError("Assignee is required")
    .required("Assignee is required")
    .min(1, "Assignee is required"),
  build: yup.string().required("Build name is required"),
  releases: yup.array().min(1, "Please select at-least one release option"),
  platforms: yup.array().min(1, "Please select at-least one platform option"),
  testCases: yup.array().min(1, "Please select at-least one test case option"),
});

export const TestCaseCreateSchema = yup.object().shape({
  summary: yup.string().required("Summary is required"),
  priority: yup
    .number()
    .typeError("Priority is required")
    .required("Priority is required")
    .min(1, "Priority is required"),
  category: yup
    .number()
    .typeError("Category is required")
    .required("Category is required")
    .min(1, "Category is required"),
  estimate: yup.string().required("Estimate is required"),
  requirements: yup.array().min(1, "Please select at-least one requirement"),
  steps: yup.array().min(1, "Please add at-least one test step"),
});

export const ProjectCreateSchema = yup.object().shape({
  prefix: yup
    .string()
    .required("Prefix is required")
    .max(5, "Prefix must be at most 5 characters long")
    .matches(/^[A-Za-z]+$/, "Prefix must contain only letters"),
  name: yup
    .string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters long")
    .max(50, "Project name must be at most 50 characters long"),
  projectType: yup.string().required("Project type is required"),
});

export const ReleaseCreateSchema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  releaseDate: yup.string().required("Date is required"),
  status: yup.string().required("Status is required"),
  type: yup.number().integer().required("Type is required"),
  version: yup.string().required("Version is required"),
  projectID: yup.string().required("Project Id is required"),
  requirements: yup.string(),
});

export const ReleaseEditSchema = yup.object({
  name: yup.string().required("Name is required"),
  releaseDate: yup.string(),
  description: yup.string(),
  type: yup.string(),
  version: yup.string(),
});

export const ProjectUpdateSchema = yup.object({
  prefix: yup
    .string()
    .required("Prefix is required")
    .max(5, "Prefix must be at most 5 characters long"),
  name: yup
    .string()
    .required("Project name is required")
    .min(3, "Project name must be at least 3 characters long")
    .max(50, "Project name must be at most 50 characters long"),
  projectType: yup.string().required("Project type is required"),
});

export const CustomFieldCreateSchema = yup.object({
  fieldTypeID: yup.string().required("Field type is required"),
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
});

export const CreateScreenSchema = yup.object({
  name: yup.string().required("name type is required"),
  description: yup.string().required("description type is required"),
  projectIDs: yup.string().required("projectIDs type is required"),
});

export const CreateTaskTypeSchema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string().required("Description is required"),
  projectIDs: yup
    .array()
    .required()
    .of(yup.string().required())
    .min(1, "At least one projectID is required"),
  screenID: yup
    .number()
    .required("Screen ID is required")
    .integer("Screen ID must be an integer"),
});
