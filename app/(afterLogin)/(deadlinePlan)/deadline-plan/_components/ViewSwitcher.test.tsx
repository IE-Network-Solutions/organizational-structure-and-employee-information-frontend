import React from 'react';
import '@testing-library/jest-dom/jest-globals';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import ViewSwitcher from './ViewSwitcher';

describe('visible task view switch', () => {
  it('offers Grouped view directly and switches from Tasks', () => {
    const onChange = jest.fn();
    render(<ViewSwitcher value="list" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: /Tasks/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Grouped view/ }));
    expect(onChange).toHaveBeenCalledWith('grouped');
  });

  it('lets the user return to the date-grouped task list', () => {
    const onChange = jest.fn();
    render(<ViewSwitcher value="grouped" onChange={onChange} />);
    expect(screen.getByRole('radio', { name: /Grouped view/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Tasks/ }));
    expect(onChange).toHaveBeenCalledWith('list');
  });
});
