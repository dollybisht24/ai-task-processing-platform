import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StatusBadge from '../components/StatusBadge';

describe('StatusBadge Component', () => {
  it('renders pending status badge correctly', () => {
    render(<StatusBadge status="pending" />);
    expect(screen.getByText('Pending')).toBeDefined();
  });

  it('renders running status badge correctly', () => {
    render(<StatusBadge status="running" />);
    expect(screen.getByText('Running')).toBeDefined();
  });

  it('renders success status badge correctly', () => {
    render(<StatusBadge status="success" />);
    expect(screen.getByText('Success')).toBeDefined();
  });

  it('renders failed status badge correctly', () => {
    render(<StatusBadge status="failed" />);
    expect(screen.getByText('Failed')).toBeDefined();
  });
});
