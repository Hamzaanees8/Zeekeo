import { api } from "./api";

export const getPersonas = async () => {
  const response = await api.get("/users/personas");
  return response.personas;
};

export const getPersona = async personaId => {
  const response = await api.get(`/users/personas?personaId=${personaId}`);
  return response.personas?.[0] || null;
};

export const createPersona = async data => {
  const response = await api.post("/users/personas", {
    persona: {
      ...data,
    },
  });
  return response.persona;
};

export const updatePersona = async (personaId, updates) => {
  const response = await api.put("/users/personas", {
    personaId,
    updates,
  });
  return response.persona;
};

export const deletePersona = async personaId => {
  const response = await api.delete("/users/personas", {
    data: {
      personaId,
    },
  });

  return response;
};

export const deletePersonas = async personaIds => {
  try {
    await Promise.all(
      personaIds.map(personaId =>
        api.delete("/users/personas", {
          data: {
            personaId,
          },
        }),
      ),
    );
  } catch (error) {
    console.error("Failed to delete personas:", error);
  }
};
