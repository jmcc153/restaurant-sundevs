import { describe, it, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Navbar } from "../components/navbar";

describe("Navbar", () => {
  it("renders the logo", () => {
    render(<Navbar />);
    expect(screen.getByText(/Mi restaurante/i)).toBeInTheDocument();
  });
});
