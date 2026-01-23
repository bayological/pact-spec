interface MarkdownProps {
  content: string;
}

export default function Markdown({ content }: MarkdownProps) {
  return (
    <article
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
