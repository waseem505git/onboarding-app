import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { GlossaryHint } from './GlossaryHint';

describe('GlossaryHint', () => {
  it('renders nothing when the text contains no recognized glossary term', () => {
    const { container } = render(<GlossaryHint text="Some unrelated mission title" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an info icon button for a recognized term', () => {
    render(<GlossaryHint text="ICE" />);
    expect(screen.getByRole('button', { name: /what is ice/i })).toBeInTheDocument();
  });

  it('shows the definition tooltip on hover and hides it again on mouse leave', () => {
    render(<GlossaryHint text="ICE" />);
    const button = screen.getByRole('button', { name: /what is ice/i });
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();

    fireEvent.mouseEnter(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent(/defect metrology tool/i);

    fireEvent.mouseLeave(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the definition tooltip on click/tap (touch devices with no hover)', () => {
    render(<GlossaryHint text="JMP" />);
    const button = screen.getByRole('button', { name: /what is jmp/i });
    fireEvent.click(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(button);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows the definition tooltip on keyboard focus for accessibility', () => {
    render(<GlossaryHint text="RFC" />);
    const button = screen.getByRole('button', { name: /what is rfc/i });
    fireEvent.focus(button);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('renders one hint per distinct recognized term', () => {
    render(<GlossaryHint text="WG and RFC" />);
    expect(screen.getByRole('button', { name: /what is wg/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /what is rfc/i })).toBeInTheDocument();
  });
});
