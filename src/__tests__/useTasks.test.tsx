import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTasks } from '../hooks/useTasks';
import * as taskApi from '../api/taskApi';
import type { Task } from '../types/task';

vi.mock('../api/taskApi');

const mockTask: Task = {
	id: 1,
	title: 'Tache test',
	description: 'Description',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('useTasks', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('loads tasks on mount', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const { result } = renderHook(() => useTasks());
		expect(result.current.loading).toBe(true);
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.tasks).toEqual([mockTask]);
		expect(result.current.error).toBeNull();
	});

	it('sets an error when loading fails', async () => {
		vi.mocked(taskApi.getTasks).mockRejectedValue(new Error('Erreur reseau'));
		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Erreur reseau');
		expect(result.current.tasks).toEqual([]);
	});

	it('adds a new task at the beginning of the list', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const newTask: Task = { ...mockTask, id: 2, title: 'Nouvelle tache' };
		vi.mocked(taskApi.createTask).mockResolvedValue(newTask);
		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.addTask({ title: 'Nouvelle tache' });
		});

		expect(result.current.tasks).toEqual([newTask, mockTask]);
	});

	it('updates a task in place with editTask', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const updatedTask: Task = { ...mockTask, title: 'Titre modifie' };
		vi.mocked(taskApi.updateTask).mockResolvedValue(updatedTask);
		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.editTask(1, { title: 'Titre modifie' });
		});

		expect(result.current.tasks[0].title).toBe('Titre modifie');
	});

	it('removes a task with removeTask', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		vi.mocked(taskApi.deleteTask).mockResolvedValue(undefined);
		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.removeTask(1);
		});

		expect(result.current.tasks).toEqual([]);
	});

	it('toggles task completion with toggleComplete', async () => {
		vi.mocked(taskApi.getTasks).mockResolvedValue([mockTask]);
		const toggledTask: Task = { ...mockTask, completed: true };
		vi.mocked(taskApi.updateTask).mockResolvedValue(toggledTask);
		const { result } = renderHook(() => useTasks());
		await waitFor(() => expect(result.current.loading).toBe(false));

		await act(async () => {
			await result.current.toggleComplete(1);
		});

		expect(taskApi.updateTask).toHaveBeenCalledWith(1, { completed: true });
		expect(result.current.tasks[0].completed).toBe(true);
	});
});