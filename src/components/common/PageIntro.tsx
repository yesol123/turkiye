interface PageIntroProps { eyebrow: string; title: string; description: string }

export default function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return <section className="language-page-intro">
    <span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p>
  </section>
}
