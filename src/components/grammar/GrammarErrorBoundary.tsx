import { Component, type ReactNode } from 'react'

export default class GrammarErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() {
    if (this.state.failed) return <section className="grammar-empty" role="alert">
      <h2>문법 화면을 불러오지 못했어요.</h2>
      <p>잠시 후 새로고침해 주세요. 다른 메뉴는 계속 이용할 수 있어요.</p>
      <button className="primary" onClick={() => window.location.reload()}>새로고침</button>
    </section>
    return this.props.children
  }
}
