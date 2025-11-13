import { api } from "./api";

export const createWorkflow = async data => {
  const response = await api.post("/users/workflows", {
    workflow: {
      name: data.name,
      workflow: data.workflow,
    },
  });

  return response.workflow;
};

export const fetchGlobalWorkflows = async () => {
  const response = await api.get("/users/workflows/global");
  return response.workflows;
};

export const fetchAgencyWorkflows = async () => {
  const response = await api.get("/users/workflows/agency-workflows");
  return response.workflows;
};

export const fetchWorkflows = async () => {
  const response = await api.get("/users/workflows");
  return response.workflows;
};

export const updateWorkflow = async (data, workflowId) => {
  const response = await api.put("/users/workflows", {
    workflowId,
    updates: {
      name: data.name,
      workflow: data.workflow,
    },
  });

  return response.workflow;
};

export const deleteWorkflow = async workflowId => {
  const response = await api.delete("/users/workflows", {
    data: {
      workflowId,
    },
  });

  return response;
};
