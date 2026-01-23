import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import remarkGfm from 'remark-gfm';
import html from 'remark-html';

const contentDirectory = path.join(process.cwd(), 'content');

export async function getMarkdownContent(filename: string): Promise<string> {
  const fullPath = path.join(contentDirectory, filename);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const result = await remark().use(remarkGfm).use(html).process(fileContents);

  return result.toString();
}
