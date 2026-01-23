import Markdown from '@/components/Markdown';
import { getMarkdownContent } from '@/lib/markdown';

export default async function Specification() {
  const content = await getMarkdownContent('SPECIFICATION.md');
  return <Markdown content={content} />;
}
