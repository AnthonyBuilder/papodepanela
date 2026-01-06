import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // Importing jest-dom for additional matchers
import App from './App';

describe('App Component', () => {
    it('renders correctly', () => {
        const { getByText } = render(<App />);
        expect(getByText('Hello World')).toBeInTheDocument();
    });
});