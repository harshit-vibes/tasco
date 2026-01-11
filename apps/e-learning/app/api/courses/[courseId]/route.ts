import {
  handleGetCourse,
  handleUpdateCourse,
  handleDeleteCourse,
} from "@tasco/api";

export const GET = handleGetCourse;
export const PATCH = handleUpdateCourse;
export const DELETE = handleDeleteCourse;
