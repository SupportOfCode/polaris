import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";
import { useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import {
  Page,
  TextField,
  Select,
  Card,
  Button,
  FormLayout,
  Modal,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useTaskStore } from "../store";
import {
  createTask,
  deleteTask,
  getTask,
  updateTask,
} from "../utils/tasks.server";
import { ArrowUpIcon, DeleteIcon } from "@shopify/polaris-icons";
import { initData, priorityOptions, statusOptions } from "app/constants";
import { formattedTask, validateData } from "app/common";

export const loader: LoaderFunction = async ({ params }) => {
  if (params.id === "new")
    return {
      data: initData,
      page: "new",
    };

  const tasks = await getTask(params.id ?? "");
  return {
    data: tasks ? formattedTask(tasks) : null,
    page: "edit",
  };
};

export const action: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const data = JSON.parse(formData.get("data") as string);
  if (request.method === "POST") await createTask(data);
  if (request.method === "PUT") await updateTask(params.id || "", data);
  if (request.method === "DELETE") await deleteTask(params.id ?? "");
  return redirect("/app");
};

export default function Task() {
  const oldTask = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const { task, setTask, editTask, resetTask } = useTaskStore();
  const [modalActive, setModalActive] = useState(false);
  const [errors, setErrors] = useState({ title: "", dueDate: "", tags: "" });
  const [loading, setLoading] = useState({ submit: false, delete: false });

  useEffect(() => {
    setTask(oldTask.data);
    return () => resetTask();
  }, [oldTask, setTask, resetTask]);

  const handleChange = (field: keyof typeof task) => (value: any) => {
    editTask(field, value);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = () => {
    if (!validateData(task, setErrors)) return;
    const formData = new FormData();
    const data = {
      title: task.title,
      description: task.description,
      dueDate: task.dueDate,
      priority: task.priority,
      tags: task.tags,
      status: task.status,
    };
    formData.append("data", JSON.stringify(data));
    fetcher.submit(formData, {
      method: oldTask.page === "new" ? "post" : "put",
    });
  };

  const handleDelete = () => {
    const formData = new FormData();
    fetcher.submit(formData, {
      method: "delete",
    });
    setModalActive(false);
  };

  useEffect(() => {
    if (fetcher.state === "idle") shopify.loading(false);
  }, [fetcher]);

  return (
    <Page
      title={oldTask.page === "new" ? "New Task" : task.title}
      narrowWidth
      backAction={{
        onAction: () => {
          navigate("/app");
          shopify.loading(true);
        },
      }}
      primaryAction={
        <Button
          icon={ArrowUpIcon}
          tone="success"
          variant="primary"
          loading={loading.submit}
          onClick={() => {
            handleSubmit();
            setLoading((prev) => ({ ...prev, submit: true }));
          }}
        >
          Submit
        </Button>
      }
      secondaryActions={
        oldTask.page === "edit" && (
          <Button
            icon={DeleteIcon}
            tone="critical"
            onClick={() => setModalActive(true)}
          >
            Delete
          </Button>
        )
      }
    >
      <Card background="bg-surface" padding="600">
        <FormLayout>
          <TextField
            label="Title"
            value={task.title}
            onChange={handleChange("title")}
            autoComplete="off"
            requiredIndicator
            error={errors.title}
            name="title"
          />

          <TextField
            label="Description"
            name="description"
            value={task.description}
            onChange={handleChange("description")}
            multiline={4}
            autoComplete="off"
          />

          <TextField
            label="Due Date"
            name="dueDate"
            type="date"
            value={task.dueDate}
            onChange={handleChange("dueDate")}
            autoComplete="off"
            error={errors.dueDate}
          />

          <Select
            label="Priority"
            options={priorityOptions}
            value={task.priority}
            onChange={handleChange("priority")}
            name="priority"
          />

          <TextField
            label="Tags (comma separated)"
            name="tags"
            value={task.tags}
            onChange={handleChange("tags")}
            autoComplete="off"
            maxLength={20}
            error={errors.tags}
          />

          <Select
            label="Status"
            options={statusOptions}
            value={task.status}
            onChange={handleChange("status")}
            name="status"
          />
        </FormLayout>
      </Card>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={`Are you sure you want to delete ${task.title} task?`}
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: () => {
            handleDelete();
            shopify.loading(true);
          },
        }}
        secondaryActions={[
          { content: "Cancel", onAction: () => setModalActive(false) },
        ]}
      >
        <Modal.Section>
          <p>This action cannot be undone.</p>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
