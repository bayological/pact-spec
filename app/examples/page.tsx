import Markdown from '@/components/Markdown';
import { getMarkdownContent } from '@/lib/markdown';

export default async function Examples() {
  const content = await getMarkdownContent('EXAMPLES.md');
  return <Markdown content={content} />;
}
