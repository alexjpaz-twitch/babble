import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  // TODO

  window.BABBLE_CONFIG = {
    "channel": "TEST"
  };

  render(<App />);
  const linkElement = screen.getByText(/READY/i);
  expect(linkElement).toBeInTheDocument();
});
