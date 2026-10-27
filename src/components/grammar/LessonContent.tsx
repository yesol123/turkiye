import type { GrammarLesson } from '../../types/grammar'
import { turkishToHangul } from '../../utils/turkishPronunciation'

export function LessonContent({ lesson }: { lesson: GrammarLesson }) {
  return <article className="grammar-lesson" aria-labelledby={lesson.id}>
    <span className="eyebrow">{lesson.level === 'temel1' ? 'TEMEL 1' : 'TEMEL 2'}</span>
    <h2 id={lesson.id}>{lesson.title}</h2>
    {lesson.turkishTitle && <p className="grammar-turkish-title" lang="tr">{lesson.turkishTitle}</p>}
    <p className="grammar-summary">{lesson.summary}</p>
    {lesson.sections.map(section => <section key={section.id} className="grammar-section" aria-labelledby={section.id}>
      <h3 id={section.id}>{section.heading}</h3>
      {section.paragraphs.map((text, index) => <p key={index}>{text}</p>)}
      {section.rules.length > 0 && <div className="grammar-rules">{section.rules.map((rule, index) => typeof rule === 'string'
        ? <p key={index} className="grammar-text-rule">{rule}</p>
        : <dl key={index}><dt>{rule.pattern}</dt><dd>{rule.description}</dd></dl>)}</div>}
      {section.examples.map(example => <div className="grammar-example" id={example.id} key={example.id}>
        {example.label && <span className="grammar-example-label">{example.label}</span>}
        <p lang="tr">{example.turkish}</p><p className="grammar-hangul">{example.pronunciation || turkishToHangul(example.turkish)}</p><p>{example.korean}</p>
      </div>)}
    </section>)}
  </article>
}

