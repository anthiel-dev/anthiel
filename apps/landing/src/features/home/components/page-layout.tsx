import { useRouterState } from "@tanstack/react-router";

import { HomeHeader } from "./home-header";
import { HomeNav, HomeNavLinks } from "./home-nav";

export function PageLayout({ children }: { children: React.ReactNode }) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const isHome = pathname === "/";

  return (
    <div className="mx-auto flex max-w-3xl flex-col pt-32 pb-16" data-reveal="true">
      <HomeHeader nav={isHome ? undefined : <HomeNavLinks revealStaggerStart={1} />} />
      <main className="flex flex-col px-10">
        {children}
        {isHome ? <HomeNav /> : null}
      </main>
    </div>
  );
}
