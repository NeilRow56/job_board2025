//MDXEditor does not support server rendering, so we need to ensure that the editor component is rendered only on client-side. To do so, we can use the dynamic utility with {ssr: false}.

import dynamic from 'next/dynamic'

export const MarkdownEditor = dynamic(() => import('./_MarkdownEditor'), {
  ssr: false
})
