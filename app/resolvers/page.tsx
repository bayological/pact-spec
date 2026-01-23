import Markdown from '@/components/Markdown';
import { getMarkdownContent } from '@/lib/markdown';

export default async function Resolvers() {
  const content = await getMarkdownContent('RESOLVERS.md');
  return <Markdown content={content} />;
}
