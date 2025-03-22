import { FlattenMaps } from "mongoose";

export type TaskType = {
  _id?: string;
  title: string;
  description?: string;
  dueDate?: string;
  priority: string;
  tags?: string;
  status: string;
};

export type dBTaskType = {
  _id?: FlattenMaps<unknown>;
  title: string;
  description?: string;
  dueDate?: Date;
  priority: string;
  tags?: string;
  status: string;
};
