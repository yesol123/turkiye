import { useState } from 'react'
import { grammarCourses } from '../../data/grammar'
import type { GrammarLevel } from '../../types/grammar'
import { LessonContent } from '../../components/grammar/LessonContent'
import PageIntro from '../../components/common/PageIntro'

export default function GrammarPage() {
  const [level, setLevel] = useState<GrammarLevel>('temel1')
  const [lessonId, setLessonId] = useState<string | null>(null)
  const course = grammarCourses.find(course => course.id === level)!
  const lesson = course.lessons.find(lesson => lesson.id === lessonId) ?? course.lessons[0]

  return <><PageIntro eyebrow="BUILD YOUR FOUNDATION" title="차근차근, 기본 문법." description="Temel 1부터 Temel 2까지, 단계별로 터키어 문법을 익혀보세요."/>
    <div className="grammar-levels" aria-label="문법 단계">{grammarCourses.map(item => <button key={item.id} aria-pressed={level === item.id} className={level === item.id ? 'active' : ''} onClick={() => { setLevel(item.id); setLessonId(null) }}><span>{item.title}</span><small>{item.description}</small><i>{item.lessons.length ? `${item.lessons.length}개 문법` : '준비 중'}</i></button>)}</div>
    {lesson ? <div className="grammar-layout"><nav className="grammar-contents" aria-label={`${course.title} 문법 목차`}>{course.lessons.map(item => <button key={item.id} className={lesson.id === item.id ? 'active' : ''} aria-current={lesson.id === item.id ? 'page' : undefined} onClick={() => setLessonId(item.id)}>{item.title}</button>)}</nav><LessonContent key={lesson.id} lesson={lesson}/></div>
      : <section className="grammar-empty" role="status"><span aria-hidden="true">Aa</span><h2>{course.title} 문법을 준비하고 있어요.</h2><p>아직 등록된 문법이 없습니다.<br/>내용이 추가되면 이곳에서 목차와 설명을 볼 수 있어요.</p></section>}
  </>
}
