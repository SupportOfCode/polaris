import Task from "app/model/Task.model.server";
import { connectDB } from "./db.server";
import { TaskType } from "app/types";
import { FilterQuery } from "mongoose";

connectDB();

type ParamsGet = {
  title?: string;
  status?: string;
  priority?: string;
  fromDate?: string;
  toDate?: string;
  tags?: string;
};

//get task pro
export const getTaskPro = async (params?: ParamsGet) => {
  try {
    const filter: FilterQuery<TaskType> = {};

    if (params?.title) {
      filter.title = { $regex: params.title, $options: "i" };
    }

    if (params?.status) {
      filter.status = params.status;
    }

    if (params?.priority) {
      filter.priority = params.priority;
    }

    if (params?.fromDate || params?.toDate) {
      filter.dueDate = {};
      if (params.fromDate) {
        filter.dueDate.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        filter.dueDate.$lte = new Date(params.toDate);
      }
    }

    if (params?.tags) {
      filter.tags = { $regex: `\\b${params.tags}\\b`, $options: "i" };
    }

    return (await Task.find(filter).lean()).reverse();
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
};

//get task
export const getTask = async (id: string) => {
  try {
    const task = await Task.findById(id).lean();
    return task;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
};

// createTask
export async function createTask(data: TaskType) {
  const { title, description, dueDate, priority, tags, status } = data;

  try {
    const newTodo = await Task.create({
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      priority,
      tags,
      status,
    });

    return newTodo;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
}

// updateTask
export async function updateTask(id: string, data: TaskType) {
  const { title, description, dueDate, priority, tags, status } = data;

  try {
    const updatedTodo = await Task.findByIdAndUpdate(
      id,
      {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        tags,
        status,
      },
      { new: true },
    );

    return updatedTodo;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
}

export async function deleteTaskPro(ids: string[]) {
  try {
    await Task.deleteMany({ _id: { $in: ids } });
    return null;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
}

export async function deleteTask(id: string) {
  try {
    await Task.findByIdAndDelete(id);
    return null;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Something went wrong");
  }
}
