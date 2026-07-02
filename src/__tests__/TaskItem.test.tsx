import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskItem } from '../components/TaskItem';
import type { Task } from '../types/task';

const mockTask: Task = {
	id: 1,
	title: 'Tache test',
	description: 'Description test',
	completed: false,
	createdAt: '2026-01-15T10:00:00Z',
	updatedAt: '2026-01-15T10:00:00Z',
};

describe('TaskItem', () => {
	it('renders the task title and description', () => {
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		expect(screen.getByText('Tache test')).toBeInTheDocument();
		expect(screen.getByText('Description test')).toBeInTheDocument();
	});

	it('calls onToggle when the checkbox is clicked', async () => {
		const user = userEvent.setup();
		const handleToggle = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={handleToggle} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		await user.click(screen.getByRole('checkbox'));
		expect(handleToggle).toHaveBeenCalledWith(1);
	});

	it('requires a second click on delete to confirm', async () => {
		const user = userEvent.setup();
		const handleDelete = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={handleDelete} onEdit={vi.fn()} />
		);
		const deleteButton = screen.getByLabelText('Supprimer');
		await user.click(deleteButton);
		expect(handleDelete).not.toHaveBeenCalled();
		await user.click(deleteButton);
		expect(handleDelete).toHaveBeenCalledWith(1);
	});

	it('switches to edit mode when the edit button is clicked', async () => {
		const user = userEvent.setup();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={vi.fn()} />
		);
		await user.click(screen.getByLabelText('Modifier'));
		expect(screen.getByLabelText('Modifier le titre')).toBeInTheDocument();
	});

	it('calls onEdit with updated values when saving', async () => {
		const user = userEvent.setup();
		const handleEdit = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={handleEdit} />
		);
		await user.click(screen.getByLabelText('Modifier'));
		const titleInput = screen.getByLabelText('Modifier le titre');
		await user.clear(titleInput);
		await user.type(titleInput, 'Titre modifie');
		await user.click(screen.getByRole('button', { name: 'Enregistrer' }));
		expect(handleEdit).toHaveBeenCalledWith(1, {
			title: 'Titre modifie',
			description: 'Description test',
		});
	});

	it('exits edit mode without calling onEdit when cancel is clicked', async () => {
		const user = userEvent.setup();
		const handleEdit = vi.fn();
		render(
			<TaskItem task={mockTask} onToggle={vi.fn()} onDelete={vi.fn()} onEdit={handleEdit} />
		);
		await user.click(screen.getByLabelText('Modifier'));
		await user.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(handleEdit).not.toHaveBeenCalled();
		expect(screen.queryByLabelText('Modifier le titre')).not.toBeInTheDocument();
	});
});