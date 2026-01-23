import Markdown from '@/components/Markdown';
import { getMarkdownContent } from '@/lib/markdown';

export default async function Home() {
  const content = await getMarkdownContent('README.md');
  return <Markdown content={content} />;
}
