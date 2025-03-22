import { dBTaskType, TaskType } from "./types";

export function formattedTask(task: dBTaskType, mapTags: boolean = false) {
  const data = {
    ...task,
    _id: task?._id?.toString() ?? "",
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "",
    tags: mapTags
      ? (task.tags ?? "").split(",").map((tag: string) => tag.trim())
      : task.tags,
  };
  return data;
}

export const validateData = (
  task: TaskType,
  setErrors: React.Dispatch<React.SetStateAction<any>>,
) => {
  let newErrors = { title: "", dueDate: "", tags: "" };
  let isValid = true;

  if (!task.title.trim()) {
    newErrors.title = "Title is required";
    isValid = false;
  }

  if (!(task.dueDate ? task.dueDate : "").trim()) {
    newErrors.dueDate = "Due Date is required";
    isValid = false;
  }

  if (
    (task.tags ? task.tags : "")
      .split(",")
      .map((tag: string) => tag.trim())
      .some((tag: string) => tag.length > 10)
  ) {
    newErrors.tags = "Each tag must be at most 10 characters";
    isValid = false;
  }

  setErrors(newErrors);
  return isValid;
};
