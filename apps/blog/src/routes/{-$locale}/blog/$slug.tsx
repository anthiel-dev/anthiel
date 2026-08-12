import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";

import { getPost } from "#content/posts";
import { DEFAULT_LOCALE, LocaleProvider, getMessages, parseLocaleParam, type Locale } from "#i18n";

export const Route = createFileRoute("/{-$locale}/blog/$slug")({
  beforeLoad: ({ params }) => {
    const parsed = parseLocaleParam(params.locale);
    if (parsed === null) throw notFound();
    if (params.locale === "en") {
      throw redirect({
        to: "/{-$locale}/blog/$slug",
        params: { slug: params.slug },
        replace: true,
      });
    }

    if (!getPost(parsed, params.slug)) throw notFound();

    return { locale: parsed };
  },
  head: ({ params }) => {
    const locale = parseLocaleParam(params.locale) ?? DEFAULT_LOCALE;
    const post = getPost(locale, params.slug);
    if (!post) {
      return { meta: [{ title: "Not found" }] };
    }
    return {
      meta: [
        { title: post.frontmatter.title },
        { name: "description", content: post.frontmatter.description },
      ],
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { locale } = Route.useRouteContext() as { locale: Locale };
  const { slug } = Route.useParams();
  const post = getPost(locale, slug);
  if (!post) throw notFound();

  const messages = getMessages(locale);
  const Content = post.Component;

  return (
    <LocaleProvider locale={locale}>
      <main className="mx-auto max-w-2xl px-6 py-16">
        <p className="text-sm">
          <Link
            to="/{-$locale}/blog"
            params={{ locale: locale === DEFAULT_LOCALE ? undefined : locale }}
            className="text-muted-foreground hover:underline"
          >
            ← {messages.blog.backToIndex}
          </Link>
        </p>

        <header className="mt-8">
          <time dateTime={post.frontmatter.date} className="text-sm text-muted-foreground">
            {post.frontmatter.date}
          </time>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">{post.frontmatter.title}</h1>
          <p className="mt-2 text-muted-foreground">{post.frontmatter.description}</p>
        </header>

        <article className="prose prose-neutral dark:prose-invert mt-10 max-w-none">
          <Content />
        </article>
      </main>
    </LocaleProvider>
  );
}
