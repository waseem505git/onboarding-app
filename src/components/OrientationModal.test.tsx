import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrientationModal, hasSeenOrientation, markOrientationSeen } from './OrientationModal';

describe('OrientationModal', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('displays the welcome title, counts, hierarchy, and first phase', () => {
    render(
      <OrientationModal
        engineerFirstName="Sam"
        totalPhases={5}
        totalModules={9}
        totalMissions={53}
        firstPhaseLabel="Welcome, Access & Communication"
        onStart={() => {}}
      />,
    );
    expect(screen.getByText('Welcome to DEFECT METROLOGY Onboarding')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('53')).toBeInTheDocument();
    expect(screen.getByText('Phase')).toBeInTheDocument();
    expect(screen.getByText('Module')).toBeInTheDocument();
    expect(screen.getByText('Mission')).toBeInTheDocument();
    expect(
      screen.getByText((_, node) => node?.textContent === 'Your journey starts with Welcome, Access & Communication.'),
    ).toBeInTheDocument();
  });

  it('shows the target completion date only when provided', () => {
    const { rerender } = render(
      <OrientationModal
        engineerFirstName="Sam"
        totalPhases={5}
        totalModules={9}
        totalMissions={53}
        firstPhaseLabel="Welcome, Access & Communication"
        onStart={() => {}}
      />,
    );
    expect(screen.queryByText(/target completion date/i)).not.toBeInTheDocument();

    rerender(
      <OrientationModal
        engineerFirstName="Sam"
        totalPhases={5}
        totalModules={9}
        totalMissions={53}
        targetCompletionDate="2026-12-01"
        firstPhaseLabel="Welcome, Access & Communication"
        onStart={() => {}}
      />,
    );
    expect(screen.getByText(/target completion date/i)).toBeInTheDocument();
  });

  it('calls onStart when "Start My Journey" is clicked', () => {
    const onStart = vi.fn();
    render(
      <OrientationModal
        engineerFirstName="Sam"
        totalPhases={5}
        totalModules={9}
        totalMissions={53}
        firstPhaseLabel="Welcome, Access & Communication"
        onStart={onStart}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /start my journey/i }));
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

describe('orientation-seen persistence', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it('reports not seen for a profile that has never dismissed the modal', () => {
    expect(hasSeenOrientation('profile-a')).toBe(false);
  });

  it('reports seen after markOrientationSeen is called, and only for that profile id', () => {
    markOrientationSeen('profile-a');
    expect(hasSeenOrientation('profile-a')).toBe(true);
    expect(hasSeenOrientation('profile-b')).toBe(false);
  });
});
