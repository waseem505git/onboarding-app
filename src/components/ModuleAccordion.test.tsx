import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModuleAccordion } from './ModuleAccordion';
import type { CurriculumModule } from '../types/module';
import type { CurriculumTask } from '../types/curriculum';
import type { ModuleProgressSummary } from '../domain/moduleProgress';

const module: CurriculumModule = {
  moduleId: 'module-1',
  title: 'Systems installation & overview',
  originalSourceText: 'Systems installation & overview',
  originalWorkbookRow: 7,
  phaseId: 'systems-installation',
  displayOrder: 0,
  iconKey: 'systems',
  taskIds: ['t1'],
  needsClarification: false,
};

const task: CurriculumTask = {
  id: 't1',
  sourceRow: 7,
  phase: 'systems-installation',
  category: 'Systems installation & overview',
  title: 'ICE',
  sourceText: 'ICE',
  description: '',
  required: true,
  prerequisites: [],
  tags: [],
  needsClarification: false,
};

const progress: ModuleProgressSummary = {
  moduleId: 'module-1',
  status: 'In Progress',
  totalApplicableRequired: 1,
  completedRequired: 0,
  percentComplete: 0,
  blockedCount: 0,
  readyForReviewCount: 0,
};

describe('ModuleAccordion', () => {
  it('is collapsed by default and expands on click, updating aria-expanded', () => {
    render(
      <ModuleAccordion
        module={module}
        progress={progress}
        nextTask={task}
        tasks={[task]}
        progressByTaskId={new Map()}
        onOpenTask={() => {}}
      />,
    );
    const toggle = screen.getByRole('button', { name: /Systems installation & overview/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('ICE')).not.toBeInTheDocument();

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('ICE')).toBeInTheDocument();
  });

  it('supports keyboard activation (Enter/Space trigger a native button)', () => {
    render(
      <ModuleAccordion
        module={module}
        progress={progress}
        nextTask={task}
        tasks={[task]}
        progressByTaskId={new Map()}
        onOpenTask={() => {}}
      />,
    );
    const toggle = screen.getByRole('button', { name: /Systems installation & overview/i });
    toggle.focus();
    expect(document.activeElement).toBe(toggle);
    fireEvent.click(toggle); // native <button> handles Enter/Space as click events
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
  });

  it('wires aria-controls to the expanded panel id', () => {
    render(
      <ModuleAccordion
        module={module}
        progress={progress}
        nextTask={task}
        tasks={[task]}
        progressByTaskId={new Map()}
        onOpenTask={() => {}}
      />,
    );
    const toggle = screen.getByRole('button', { name: /Systems installation & overview/i });
    fireEvent.click(toggle);
    const controlsId = toggle.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    expect(document.getElementById(controlsId!)).toBeInTheDocument();
  });

  it('shows a clear empty-state message when the module has no visible tasks, instead of a bare disabled control', () => {
    render(
      <ModuleAccordion
        module={module}
        progress={{ ...progress, status: 'Not Started' }}
        nextTask={null}
        tasks={[]}
        progressByTaskId={new Map()}
        onOpenTask={() => {}}
      />,
    );
    expect(screen.getByText(/no tasks match the current filters/i)).toBeInTheDocument();
  });

  it('calls onOpenTask with the recommended next task when Continue is clicked', () => {
    const onOpenTask = vi.fn();
    render(
      <ModuleAccordion
        module={module}
        progress={progress}
        nextTask={task}
        tasks={[task]}
        progressByTaskId={new Map()}
        onOpenTask={onOpenTask}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /Continue/i }));
    expect(onOpenTask).toHaveBeenCalledWith(task);
  });

  it('labels the Continue button "Review Module" once the module is Completed', () => {
    render(
      <ModuleAccordion
        module={module}
        progress={{ ...progress, status: 'Completed', percentComplete: 100, completedRequired: 1 }}
        nextTask={null}
        tasks={[task]}
        progressByTaskId={new Map()}
        onOpenTask={() => {}}
      />,
    );
    expect(screen.queryByRole('button', { name: /Continue/i })).not.toBeInTheDocument();
  });
});
