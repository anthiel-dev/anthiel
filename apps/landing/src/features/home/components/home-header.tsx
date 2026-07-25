import { Link } from "@tanstack/react-router";

export function HomeHeader() {
  return (
    <header className="flex items-end justify-between px-6 sm:px-10">
      <h1 className="font-heading text-3xl font-bold" data-reveal-item data-stagger="0">
        <Link to="/">Anthiel.</Link>
      </h1>
    </header>
  );
}
