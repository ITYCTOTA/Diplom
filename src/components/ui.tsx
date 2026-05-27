export function TagRow({ tags }: { tags: string[] }) {
  return (
    <div className="tag-row">
      {tags.map((tag) => (
        <span className="tag" key={tag}>
          {tag}
        </span>
      ))}
    </div>
  )
}

export function SectionTitle({
  title,
  description,
  meta,
}: {
  title: string
  description?: string
  meta?: string
}) {
  return (
    <div className="section-title">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {meta && <span>{meta}</span>}
    </div>
  )
}

export function Metric({ value, label }: { value: string; label: string }) {
  return (
    <article className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  )
}

export function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="fact">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function Post({ author, text }: { author: string; text: string }) {
  return (
    <article className="post">
      <span className="post-avatar" aria-hidden="true">
        {author.slice(0, 1)}
      </span>
      <div>
        <strong>{author}</strong>
        <p>{text}</p>
      </div>
    </article>
  )
}
