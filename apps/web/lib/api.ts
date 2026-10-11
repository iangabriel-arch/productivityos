export const getTasks = () =>
  fetch('/api/tasks').then(r => r.json());

export const createTask = (data: { title: string; priority?: string; dueDate?: string }) =>
  fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

export const completeTask = (id: string) =>
  fetch(`/api/tasks/${id}`, { method: 'POST' }).then(r => r.json());