/**
 * Unit tests for ClarifyButton component
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClarifyButton } from '../ClarifyButton';

describe('ClarifyButton', () => {
  it('should render available button', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={true} />);
    
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent('Clarify with Mirastros');
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={true} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should render unavailable state for freemium users', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={false} />);
    
    expect(screen.getByText('Clarify with Mirastros')).toBeInTheDocument();
    expect(screen.getByText('Premium')).toBeInTheDocument();
    
    // Should not be a button
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should not call onClick when unavailable', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={false} />);
    
    const div = screen.getByText('Clarify with Mirastros').parentElement;
    if (div) {
      fireEvent.click(div);
    }
    
    expect(onClick).not.toHaveBeenCalled();
  });

  it('should render compact variant', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={true} variant="compact" />);
    
    const text = screen.getByText('Clarify with Mirastros');
    expect(text).toHaveClass('text-sm');
  });

  it('should apply custom className', () => {
    const onClick = vi.fn();
    render(<ClarifyButton onClick={onClick} available={true} className="custom-class" />);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });
});
