import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

test('renders Safar Khana brand from archive', async () => {
  render(<App />);
  await waitFor(() => {
    expect(screen.getAllByText(/safarkhana/i).length).toBeGreaterThan(0);
  });
});
