import ReactMarkdown from "react-markdown";

type AskMarkdownContentProps = {
  content: string;
};

// 물어보기의 AI 답변을 말풍선 디자인에 맞는 안전한 마크다운으로 표시합니다.
export function AskMarkdownContent({ content }: AskMarkdownContentProps) {
  return (
    <div className="whitespace-normal break-words">
      <ReactMarkdown
        skipHtml
        components={{
          p: ({ children }) => (
            <p className="mb-gap-y-s last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="mb-gap-y-s list-disc space-y-gap-y-xs pl-padding-x-m last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-gap-y-s list-decimal space-y-gap-y-xs pl-padding-x-m last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="pl-0.5">{children}</li>,
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all font-semibold underline underline-offset-2"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="rounded bg-overlay-base/10 px-1 py-0.5 break-all">
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote className="mb-gap-y-s border-l-2 border-border-base pl-padding-x-s text-text-secondary last:mb-0">
              {children}
            </blockquote>
          ),
          h1: ({ children }) => (
            <p className="mb-gap-y-s font-bold last:mb-0">{children}</p>
          ),
          h2: ({ children }) => (
            <p className="mb-gap-y-s font-bold last:mb-0">{children}</p>
          ),
          h3: ({ children }) => (
            <p className="mb-gap-y-s font-bold last:mb-0">{children}</p>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
