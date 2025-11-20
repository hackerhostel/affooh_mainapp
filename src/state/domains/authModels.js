import * as yup from "yup";

export const LoginSchema = yup.object({
  username: yup.string().required(),
  password: yup.string().required(),
});

export const ForgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Email must be valid")
    .required("Email is required"),
});

export const SprintSchema = yup.object({
  sprintName: yup.string().required("Sprint name is required"),
  startDate: yup.date().required("Start date is required"),
  endDate: yup
    .date()
    .required("End date is required")
    .min(yup.ref("startDate"), "End date cannot be before start date"),
});

export const RegisterSchema = yup.object({
  username: yup
    .string()
    .email("Email must be valid")
    .required("Email is required"),
  firstName: yup.string().required("First Name is required"),
  lastName: yup.string().required("Last Name is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm Password is required"),
});

export const TaskCreateSchema = yup.object({
  taskTypeID: yup.string().required("task type is required"),
  name: yup.string().required("task title is required"),
  description: yup.string(),
  taskOwner: yup.number(),
  epic: yup.number(),
  assignee: yup.number(),
});

export const HeaderTaskCreateSchema = yup.object({
  sprintID: yup.string().required("sprint is required"),
  taskTypeID: yup.string().required("task type is required"),
  name: yup.string().required("task title is required"),
  description: yup.string(),
  taskOwner: yup.number(),
  epic: yup.number(),
  assignee: yup.number(),
});
