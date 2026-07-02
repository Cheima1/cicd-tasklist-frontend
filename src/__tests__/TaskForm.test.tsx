import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TaskForm } from '../components/TaskForm';

describe('TaskForm', () => {
	it('renders the form with empty fields in create mode', () => {
		render(<TaskForm onSubmit={vi.fn()} />);
		expect(screen.getByTestId('task-form')).toBeInTheDocument();
		expect(screen.getByLabelText('Titre')).toHaveValue('');
		expect(screen.getByLabelText('Description')).toHaveValue('');
	});

	it('shows a validation error when submitting without a title', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByRole('alert')).toHaveTextContent('Le titre est requis');
	});

	it('calls onSubmit with the correct payload when valid', async () => {
		const user = userEvent.setup();
		const handleSubmit = vi.fn();
		render(<TaskForm onSubmit={handleSubmit} />);
		await user.type(screen.getByLabelText('Titre'), 'Ma nouvelle tache');
		await user.type(screen.getByLabelText('Description'), 'Ma description');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(handleSubmit).toHaveBeenCalledWith({
			title: 'Ma nouvelle tache',
			description: 'Ma description',
		});
	});

	it('clears the fields after submit in create mode', async () => {
		const user = userEvent.setup();
		render(<TaskForm onSubmit={vi.fn()} />);
		await user.type(screen.getByLabelText('Titre'), 'Tache temporaire');
		await user.click(screen.getByRole('button', { name: 'Ajouter' }));
		expect(screen.getByLabelText('Titre')).toHaveValue('');
	});

	it('pre-fills the fields and shows edit labels in edit mode', () => {
		render(
			<TaskForm
				onSubmit={vi.fn()}
				mode="edit"
				initialValues={{ title: 'Titre existant', description: 'Desc existante' }}
			/>
		);
		expect(screen.getByLabelText('Titre')).toHaveValue('Titre existant');
		expect(screen.getByRole('button', { name: 'Modifier' })).toBeInTheDocument();
	});

	it('calls onCancel when the cancel button is clicked', async () => {
		const user = userEvent.setup();
		const handleCancel = vi.fn();
		render(<TaskForm onSubmit={vi.fn()} onCancel={handleCancel} />);
		await user.click(screen.getByRole('button', { name: 'Annuler' }));
		expect(handleCancel).toHaveBeenCalledOnce();
	});
});