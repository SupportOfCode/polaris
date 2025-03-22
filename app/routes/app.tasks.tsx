import { ActionFunction, LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  useSearchParams,
  useFetcher,
  useNavigate,
} from "@remix-run/react";
import {
  Page,
  IndexTable,
  Card,
  useIndexResourceState,
  TextField,
  Button,
  Badge,
  Modal,
  useSetIndexFiltersMode,
  IndexFiltersMode,
  ChoiceList,
  IndexFilters,
} from "@shopify/polaris";
import type { IndexFiltersProps } from "@shopify/polaris";
import { DeleteIcon } from "@shopify/polaris-icons";
import { dBTaskType, TaskType } from "app/types";
import { deleteTaskPro, getTaskPro } from "app/utils/tasks.server";
import { useState, useEffect, useCallback, useDeferredValue } from "react";
import { formattedTask } from "../common";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const title = url.searchParams.get("title") || "";
  const tags = url.searchParams.get("tags") || "";
  const status = url.searchParams.get("status") || "";
  const priority = url.searchParams.get("priority") || "";
  const fromDate = url.searchParams.get("fromDate") || "";
  const toDate = url.searchParams.get("toDate") || "";

  try {
    const tasks = await getTaskPro({
      title,
      tags,
      status,
      priority,
      fromDate,
      toDate,
    });
    const data = tasks.map((task: dBTaskType) => formattedTask(task, true));
    return data;
  } catch (error) {
    console.error("Failed to load tasks:", error);
    return [];
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const ids = formData.getAll("ids") as string[];
  if (request.method === "DELETE") return await deleteTaskPro(ids);
};

export default function Tasks() {
  const tasks = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    title: searchParams.get("title") || "",
    tags: searchParams.get("tag") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    status: [] as string[],
    priority: [] as string[],
  });
  const [modalActive, setModalActive] = useState(false);
  const navigate = useNavigate();
  const { mode, setMode } = useSetIndexFiltersMode(IndexFiltersMode.Filtering);
  const handleFilterChange = useCallback(
    (key: keyof typeof filters, value: any) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      shopify.loading(true);
    },
    [],
  );

  const handleQueryClear = useCallback(() => {
    setFilters((prev) => ({ ...prev, title: "" }));
  }, []);

  const handleClearAll = useCallback(() => {
    shopify.loading(true);
    setFilters({
      title: "",
      tags: "",
      fromDate: "",
      toDate: "",
      status: [],
      priority: [],
    });
  }, []);

  const appliedFilters: IndexFiltersProps["appliedFilters"] = [];
  if (filters.status.length > 0) {
    appliedFilters.push({
      key: "status",
      label: `Status: ${filters.status.join(", ")}`,
      onRemove: () => setFilters((prev) => ({ ...prev, status: [] })),
    });
  }

  if (filters.priority.length > 0) {
    appliedFilters.push({
      key: "priority",
      label: `Priority: ${filters.priority.join(", ")}`,
      onRemove: () => setFilters((prev) => ({ ...prev, priority: [] })),
    });
  }

  if (filters.fromDate || filters.toDate) {
    appliedFilters.push({
      key: "dueDate",
      label: `Due Date: ${filters.fromDate || "..."} → ${
        filters.toDate || "..."
      }`,
      onRemove: () =>
        setFilters((prev) => ({ ...prev, fromDate: "", toDate: "" })),
    });
  }

  if (filters.tags) {
    appliedFilters.push({
      key: "taggedWith",
      label: `Tagged with: ${filters.tags}`,
      onRemove: () => setFilters((prev) => ({ ...prev, tags: "" })),
    });
  }

  const {
    selectedResources,
    allResourcesSelected,
    handleSelectionChange,
    clearSelection,
  } = useIndexResourceState(tasks, {
    resourceIDResolver: (task) => String(task._id),
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      let hasChanged = false;

      const updateParam = (key: string, value?: string) => {
        if (value && value !== params.get(key)) {
          params.set(key, value);
          hasChanged = true;
        } else if (!value && params.has(key)) {
          params.delete(key);
          hasChanged = true;
        }
      };
      updateParam("title", filters.title.trim() || undefined);
      updateParam("tags", filters.tags.trim() || undefined);
      updateParam("fromDate", filters.fromDate || undefined);
      updateParam("toDate", filters.toDate || undefined);
      updateParam(
        "status",
        filters.status.length > 0 ? filters.status[0] : undefined,
      );
      updateParam(
        "priority",
        filters.priority.length > 0 ? filters.priority[0] : undefined,
      );

      if (hasChanged) {
        setSearchParams(params);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [
    filters.title,
    filters.tags,
    filters.fromDate,
    filters.toDate,
    filters.status,
    filters.priority,
    searchParams,
  ]);

  const handleDelete = async () => {
    if (selectedResources.length > 0) {
      const formData = new FormData();
      selectedResources.forEach((id) => formData.append("ids", id));
      fetcher.submit(formData, { method: "delete" });
      setModalActive(false);
      clearSelection();
    }
  };

  const promotedBulkActions = [
    {
      icon: DeleteIcon,
      destructive: true,
      content: "Delete tasks",
      onAction: () => setModalActive(true),
    },
  ];

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (fetcher.state === "idle") shopify.loading(false);
  }, [fetcher, tasks]);

  return (
    <Page
      title="Task List"
      primaryAction={
        <Button
          loading={loading}
          url="/app/task/new"
          tone="success"
          variant="primary"
          onClick={() => setLoading(true)}
        >
          Add Task
        </Button>
      }
    >
      <Card>
        <IndexFilters
          queryValue={filters.title}
          queryPlaceholder="Search tasks"
          onQueryChange={(value) => handleFilterChange("title", value)}
          onQueryClear={handleQueryClear}
          selected={0}
          appliedFilters={appliedFilters}
          onClearAll={handleClearAll}
          tabs={[]}
          filters={[
            {
              key: "status",
              label: "Status",
              filter: (
                <ChoiceList
                  title="Status"
                  choices={[
                    { label: "Not Started", value: "Not Started" },
                    { label: "In Progress", value: "In Progress" },
                    { label: "Completed", value: "Completed" },
                  ]}
                  selected={filters.status}
                  onChange={(value) => handleFilterChange("status", value)}
                  // allowMultiple
                />
              ),
              pinned: true,
            },
            {
              key: "priority",
              label: "Priority",
              filter: (
                <ChoiceList
                  title="Priority"
                  choices={[
                    { label: "Low", value: "Low" },
                    { label: "Medium", value: "Medium" },
                    { label: "High", value: "High" },
                  ]}
                  selected={filters.priority}
                  onChange={(value) => handleFilterChange("priority", value)}
                  // allowMultiple
                />
              ),
              pinned: true,
            },
            {
              key: "dueDate",
              label: "Due Date",
              filter: (
                <>
                  <TextField
                    type="date"
                    label="From"
                    value={filters.fromDate}
                    onChange={(value) => handleFilterChange("fromDate", value)}
                    autoComplete="off"
                  />
                  <TextField
                    type="date"
                    label="To"
                    value={filters.toDate}
                    onChange={(value) => handleFilterChange("toDate", value)}
                    autoComplete="off"
                  />
                </>
              ),
              pinned: true,
            },
            {
              key: "taggedWith",
              label: "Tagged with",
              filter: (
                <TextField
                  label="Tagged with"
                  value={filters.tags}
                  onChange={(value) => handleFilterChange("tags", value)}
                  autoComplete="off"
                  labelHidden
                />
              ),
              pinned: true,
            },
          ]}
          mode={mode}
          setMode={setMode}
        />
        <IndexTable
          promotedBulkActions={promotedBulkActions}
          resourceName={{ singular: "task", plural: "tasks" }}
          itemCount={tasks.length}
          selectedItemsCount={
            allResourcesSelected ? "All" : selectedResources.length
          }
          onSelectionChange={handleSelectionChange}
          headings={[
            { title: "Title" },
            { title: "Description" },
            { title: "Status" },
            { title: "Priority" },
            { title: "Due Date" },
            { title: "Tags" },
          ]}
        >
          {tasks.map(
            (
              {
                _id,
                title,
                description,
                status,
                priority,
                dueDate,
                tags,
              }: TaskType,
              index: number,
            ) => (
              <IndexTable.Row
                id={_id ?? ""}
                key={_id}
                position={index}
                selected={selectedResources.includes(_id ?? "")}
                onClick={() => {
                  navigate(`/app/task/${_id}`);
                  shopify.loading(true);
                }}
              >
                <IndexTable.Cell>{title}</IndexTable.Cell>
                <IndexTable.Cell>
                  {description || "No description"}
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge
                    tone={
                      status === "Completed"
                        ? "success"
                        : status === "In Progress"
                          ? "attention"
                          : "critical"
                    }
                  >
                    {status}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>
                  <Badge
                    tone={
                      priority === "Low"
                        ? "success"
                        : priority === "Medium"
                          ? "attention"
                          : "critical"
                    }
                  >
                    {priority}
                  </Badge>
                </IndexTable.Cell>
                <IndexTable.Cell>{dueDate}</IndexTable.Cell>
                <IndexTable.Cell>
                  {Array.isArray(tags) && tags[0] !== ""
                    ? tags.map((tag, i) => (
                        <Badge key={i} tone="info">
                          {tag}
                        </Badge>
                      ))
                    : "No tags"}
                </IndexTable.Cell>
              </IndexTable.Row>
            ),
          )}
        </IndexTable>
      </Card>
      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={`Are you sure you want to delete ${selectedResources.length} task(s)?`}
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: handleDelete,
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
