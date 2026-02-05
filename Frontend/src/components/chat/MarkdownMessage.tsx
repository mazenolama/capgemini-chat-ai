import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'

type Props = { content: string }

export default function MarkdownMessage({ content }: Props) {
  return (
    <div className="prose prose-zinc max-w-none dark:prose-invert prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-4 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
