import { render, screen } from "@testing-library/react";
import LoginDialog from "./LoginDialog";

let socket = {
  on: () => null,
};

test("renders login dialog", () => {
  render(<LoginDialog socket={socket} open={true} onClose={() => null} />);
  const linkElement = screen.getByText(/Blastoff/i);
  expect(linkElement).toBeInTheDocument();
});
