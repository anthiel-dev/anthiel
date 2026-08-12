import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";

import { getPosts } from "#content/posts";
import {
  DEFAULT_LOCALE,
  LocaleProvider,
  getMessages,
  localePath,
  parseLocaleParam,
  type Locale,
} from "#i18n";

export const Route = createFileRoute("/{-$locale}/blog/")({
  beforeLoad: ({ params }) => {
    const parsed = parseLocaleParam(params.locale);
    if (parsed === null) throw notFound();
    if (params.locale === "en") {
      throw redirect({ to: "/{-$locale}/blog", replace: true });
    }
    return { locale: parsed };
  },
  head: ({ params }) => {
    const locale = parseLocaleParam(params.locale) ?? DEFAULT_LOCALE;
    const messages = getMessages(locale);
    return {
      meta: [
        { title: messages.blog.title },
        { name: "description", content: messages.meta.description },
      ],
    };
  },
  component: BlogIndexPage,
});

function BlogIndexPage() {
  const { locale } = Route.useRouteContext() as { locale: Locale };
  const messages = getMessages(locale);
  const posts = getPosts(locale);

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-semibold tracking-tight">{messages.blog.title}</h1>
        <p className="mt-2 text-muted-foreground">{messages.meta.description}</p>

        {posts.length === 0 ? (
          <p className="mt-10 text-muted-foreground">{messages.blog.empty}</p>
        ) : (
          <ul className="mt-10 space-y-8">
            {posts.map((post) => (
              <li key={post.slug}>
                <Link
                  to="/{-$locale}/blog/$slug"
                  params={{
                    locale: locale === DEFAULT_LOCALE ? undefined : locale,
                    slug: post.slug,
                  }}
                  className="group block"
                >
                  <time dateTime={post.frontmatter.date} className="text-sm text-muted-foreground">
                    {post.frontmatter.date}
                  </time>
                  <h2 className="mt-1 text-xl font-medium group-hover:underline">
                    {post.frontmatter.title}
                  </h2>
                  <p className="mt-1 text-muted-foreground">{post.frontmatter.description}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <p className="mt-16 text-sm text-muted-foreground">
          <a href={localePath(locale)} className="hover:underline">
            Anthiel
          </a>
        </p>
      </main>
    </LocaleProvider>
  );
}
