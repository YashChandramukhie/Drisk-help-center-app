import Image from "next/image";
import type { ArticleSection, ContentBlock } from "../lib/content";

function ContentBlockView({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p>{block.text}</p>;
    case "heading":
      return block.level === 3 ? <h4>{block.text}</h4> : <h3>{block.text}</h3>;
    case "ordered-list":
      return <ol>{block.items.map((item) => <li key={item}>{item}</li>)}</ol>;
    case "bullet-list":
      return <ul>{block.items.map((item) => <li key={item}>{item}</li>)}</ul>;
    case "image":
      return (
        <figure>
          <Image src={block.src} alt={block.alt} width={1200} height={675} />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
  }
}

export function ArticleContent({ sections }: { sections?: ArticleSection[] }) {
  if (!sections || sections.length === 0) {
    return <p>This article does not have published content yet.</p>;
  }

  return (
    <div className="article-content">
      {sections.map((section) => (
        <section key={section.id} aria-labelledby={`${section.id}-heading`}>
          <h2 id={`${section.id}-heading`}>{section.title}</h2>
          {section.blocks.map((block, index) => (
            <ContentBlockView key={`${section.id}-${block.type}-${index}`} block={block} />
          ))}
        </section>
      ))}
    </div>
  );
}
