import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Internal hrefs go through next/link for client navigation; anything with a
 * scheme is treated as off-site and gets the usual rel guard. Bare fragments
 * (`#section`) stay plain anchors — Link would rewrite them into a route.
 */
const components: Components = {
  a({ href, children }) {
    const target = href ?? "";

    if (target.startsWith("/")) {
      return <Link href={target}>{children}</Link>;
    }

    if (target.startsWith("#") || !target) {
      return <a href={target}>{children}</a>;
    }

    return (
      <a href={target} target="_blank" rel="noopener noreferrer nofollow">
        {children}
      </a>
    );
  },
};

/**
 * An article body, stored as GitHub-flavoured markdown.
 *
 * react-markdown builds React elements rather than an HTML string, so there is
 * no dangerouslySetInnerHTML here and no sanitiser to keep current: raw HTML in
 * the source is inert unless rehype-raw is added, which it deliberately is not.
 * Typography comes from the `prose-legal` class on the wrapping <article>, the
 * same one the compiled articles used.
 */
export function ArticleBody({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {markdown}
    </ReactMarkdown>
  );
}
