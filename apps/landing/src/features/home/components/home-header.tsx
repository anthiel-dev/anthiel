import { Link } from "@tanstack/react-router";

export function HomeHeader({ nav }: { nav?: React.ReactNode; revealStagger?: number }) {
  return (
    <header className="flex items-end justify-between px-10">
      <h1 className="font-heading text-3xl font-bold">
        <Link to="/">anthiel.</Link>
      </h1>
      {nav}
    </header>
  );
}
