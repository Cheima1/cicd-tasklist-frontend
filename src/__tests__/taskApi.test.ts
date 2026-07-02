import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTasks, createTask, updateTask, deleteTask } from '../api/taskApi';

const mockTask = {
	id: 1,
	title: 'Test',
	description: null,
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

beforeEach(() => {
	vi.restoreAllMocks();
});

describe('taskApi', () => {
	it('getTasks returns array', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve([mockTask]),
			})
		);

		const tasks = await getTasks();
		expect(tasks).toEqual([mockTask]);
		expect(fetch).toHaveBeenCalledWith('/api/tasks');
	});

	it('getTask returns a single task', async () => {
                vi.stubGlobal(
                        'fetch',
                        vi.fn().mockResolvedValue({
                                ok: true,
                                json: () => Promise.resolve(mockTask),
                        })
                );
                const { getTask } = await import('../api/taskApi');
                const task = await getTask(1);
                expect(task).toEqual(mockTask);
                expect(fetch).toHaveBeenCalledWith('/api/tasks/1');
        });

        it('createTask sends POST request with correct body', async () => {
                vi.stubGlobal(
                        'fetch',
                        vi.fn().mockResolvedValue({
                                ok: true,
                                json: () => Promise.resolve(mockTask),
                        })
                );
                const payload = { title: 'Nouvelle tache', description: 'Desc' };
                const task = await createTask(payload);
                expect(task).toEqual(mockTask);
                expect(fetch).toHaveBeenCalledWith('/api/tasks', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                });
        });

        it('updateTask sends PUT request with correct body', async () => {
                vi.stubGlobal(
                        'fetch',
                        vi.fn().mockResolvedValue({
                                ok: true,
                                json: () => Promise.resolve({ ...mockTask, title: 'Modifie' }),
                        })
                );
                const payload = { title: 'Modifie' };
                const task = await updateTask(1, payload);
                expect(task.title).toBe('Modifie');
                expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload),
                });
        });

        it('deleteTask sends DELETE request', async () => {
                vi.stubGlobal(
                        'fetch',
                        vi.fn().mockResolvedValue({
                                ok: true,
                        })
                );
                await deleteTask(1);
                expect(fetch).toHaveBeenCalledWith('/api/tasks/1', {
                        method: 'DELETE',
                });
        });

        it('getTasks throws an error on failed response', async () => {
                vi.stubGlobal(
                        'fetch',
                        vi.fn().mockResolvedValue({
                                ok: false,
                                status: 500,
                                text: () => Promise.resolve('Server error'),
                        })
                );
                await expect(getTasks()).rejects.toThrow('HTTP 500: Server error');
        });
});
