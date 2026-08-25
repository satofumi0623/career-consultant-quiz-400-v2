import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import questions from './data/questions.json'
import './styles.css'

const LETTERS = ['A', 'B', 'C', 'D']
const FIELDS = [...new Set(questions.map((q) => q.field))]
const MIX_LABEL = '総合ミックス100問'

function shuffle(items) {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function Setup({ onStart }) {
  // 初期状態では、すべて未選択にする
  const [fields, setFields] = useState([])
  const [mixMode, setMixMode] = useState(false)
  const [count, setCount] = useState('25')
  const [shuffleOptions, setShuffleOptions] = useState(true)

  const available = mixMode
    ? Math.min(100, questions.length)
    : questions.filter((q) => fields.includes(q.field)).length

  const canStart = mixMode || fields.length > 0

  const toggleField = (field) => {
    // 分野を選んだ場合は、総合ミックスを解除する
    setMixMode(false)
    setFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field]
    )
  }

  const toggleMixMode = () => {
    setMixMode((current) => {
      const next = !current
      if (next) setFields([])
      return next
    })
  }

  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">養成講座 修了試験対策</span>
        <h1>総合400問</h1>
        <p>
          回答すると、その場で正誤と解説を確認できます。
          分野別学習または総合ミックス100問を選んでください。
        </p>
      </section>

      <section className="card setup">
        <h2>出題設定</h2>

        <fieldset>
          <legend>分野別学習</legend>
          <div className="checks">
            {FIELDS.map((field) => (
              <label key={field}>
                <input
                  type="checkbox"
                  checked={fields.includes(field)}
                  onChange={() => toggleField(field)}
                />
                <span>{field}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>総合モード</legend>
          <div className="checks">
            <label>
              <input
                type="checkbox"
                checked={mixMode}
                onChange={toggleMixMode}
              />
              <span>{MIX_LABEL}</span>
            </label>
          </div>
          <p className="muted">
            全400問から分野を混ぜてランダムに100問を出題します。
          </p>
        </fieldset>

        <fieldset>
          <legend>問題数</legend>
          {mixMode ? (
            <div className="fixedCount">100問固定</div>
          ) : (
            <select value={count} onChange={(e) => setCount(e.target.value)}>
              <option value="10">10問</option>
              <option value="25">25問</option>
              <option value="50">50問</option>
              <option value="100">100問</option>
              <option value="all">選択分野の全問</option>
            </select>
          )}
        </fieldset>

        <label className="switch">
          <input
            type="checkbox"
            checked={shuffleOptions}
            onChange={(e) => setShuffleOptions(e.target.checked)}
          />
          <span>選択肢の順番もランダムにする</span>
        </label>

        <p className="muted">
          {canStart ? `出題予定：${available}問` : '分野または総合ミックス100問を選択してください。'}
        </p>

        <button
          className="primary"
          disabled={!canStart}
          onClick={() =>
            onStart({ fields, count, shuffleOptions, mixMode })
          }
        >
          {mixMode ? '総合ミックス100問を開始' : '1問1答を開始'}
        </button>
      </section>
    </main>
  )
}

function Quiz({ session, setSession, onQuit }) {
  const [showAnswer, setShowAnswer] = useState(false)

  const question = session.items[session.index]
  const selected = session.answers[question.id]
  const isCorrect = selected === question.answer

  const selectAnswer = (source) => {
    if (showAnswer) return

    setSession((current) => ({
      ...current,
      answers: {
        ...current.answers,
        [question.id]: source,
      },
    }))
    setShowAnswer(true)
  }

  const goNext = () => {
    if (!showAnswer) return

    if (session.index === session.items.length - 1) {
      setSession((current) => ({ ...current, done: true }))
      return
    }

    setShowAnswer(false)
    setSession((current) => ({ ...current, index: current.index + 1 }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <main className="shell">
      <header className="quizHead">
        <div>
          <span className="eyebrow">
            {session.mixMode ? MIX_LABEL : question.field}
          </span>
          <strong>
            {session.index + 1} / {session.items.length}
          </strong>
        </div>
        <div className="progress">
          <i
            style={{
              width: `${((session.index + 1) / session.items.length) * 100}%`,
            }}
          />
        </div>
      </header>

      <section className="card question">
        <div className="meta">
          <span>{question.field}</span>
          <span>{question.theme}</span>
          <span>{question.difficulty}</span>
        </div>

        <h1>{question.question}</h1>

        <div className="options">
          {question.displayOptions.map((option, index) => {
            const selectedOption = selected === option.source
            const correctOption = showAnswer && option.source === question.answer
            const wrongOption = showAnswer && selectedOption && !correctOption

            const classNames = [
              selectedOption ? 'selected' : '',
              correctOption ? 'answer-correct' : '',
              wrongOption ? 'answer-wrong' : '',
            ]
              .filter(Boolean)
              .join(' ')

            return (
              <button
                key={option.source}
                className={classNames}
                onClick={() => selectAnswer(option.source)}
                disabled={showAnswer}
              >
                <b>{LETTERS[index]}</b>
                <span>{option.text}</span>
              </button>
            )
          })}
        </div>

        {showAnswer && (
          <section
            className={`answerFeedback ${
              isCorrect ? 'feedbackCorrect' : 'feedbackWrong'
            }`}
            aria-live="polite"
          >
            <h2>{isCorrect ? '正解です' : '不正解です'}</h2>

            {!isCorrect && (
              <p>
                <strong>あなたの回答：</strong>
                {question.options[selected]}
              </p>
            )}

            <p>
              <strong>正答：</strong>
              {question.options[question.answer]}
            </p>

            <div className="explain">
              <strong>解説</strong>
              <p>{question.explanation}</p>
            </div>
          </section>
        )}

        <div className="actions">
          <button className="ghost" onClick={onQuit}>
            中断して設定へ戻る
          </button>

          <button className="primary" disabled={!showAnswer} onClick={goNext}>
            {session.index === session.items.length - 1
              ? '結果を見る'
              : '次の問題'}
          </button>
        </div>
      </section>
    </main>
  )
}

function Result({ session, onRestart }) {
  const correctCount = session.items.filter(
    (q) => session.answers[q.id] === q.answer
  ).length
  const percentage = Math.round((correctCount / session.items.length) * 100)
  const [filter, setFilter] = useState('wrong')

  const shownItems = useMemo(
    () =>
      session.items.filter(
        (q) => filter === 'all' || session.answers[q.id] !== q.answer
      ),
    [session, filter]
  )

  return (
    <main className="shell">
      <section className="hero resultHero">
        <span className="eyebrow">
          {session.mixMode ? MIX_LABEL : '学習結果'}
        </span>
        <h1>
          {correctCount} / {session.items.length}問
        </h1>
        <p>正答率 {percentage}%</p>
        <button className="primary light" onClick={onRestart}>
          条件を変えて再挑戦
        </button>
      </section>

      <section className="reviewHead">
        <h2>復習</h2>
        <div>
          <button
            className={filter === 'wrong' ? 'tab active' : 'tab'}
            onClick={() => setFilter('wrong')}
          >
            誤答のみ
          </button>
          <button
            className={filter === 'all' ? 'tab active' : 'tab'}
            onClick={() => setFilter('all')}
          >
            全問
          </button>
        </div>
      </section>

      {shownItems.length === 0 ? (
        <section className="card empty">全問正解です。</section>
      ) : (
        shownItems.map((q, index) => {
          const picked = session.answers[q.id]
          const isCorrect = picked === q.answer

          return (
            <article className="card review" key={q.id}>
              <span className={isCorrect ? 'status ok' : 'status ng'}>
                {isCorrect ? '正解' : '不正解'}
              </span>
              <h3>
                {index + 1}. {q.question}
              </h3>
              <p>
                <strong>分野：</strong>
                {q.field}
              </p>
              <p>
                <strong>あなたの回答：</strong>
                {picked ? q.options[picked] : '未回答'}
              </p>
              <p>
                <strong>正答：</strong>
                {q.options[q.answer]}
              </p>
              <div className="explain">{q.explanation}</div>
            </article>
          )
        })
      )}
    </main>
  )
}

function App() {
  const [session, setSession] = useState(null)

  const start = ({ fields, count, shuffleOptions, mixMode }) => {
    let pool

    if (mixMode) {
      // 全400問から分野を混ぜてランダムに100問を選ぶ
      pool = shuffle(questions).slice(0, Math.min(100, questions.length))
    } else {
      const candidates = questions.filter((q) => fields.includes(q.field))
      const numberOfQuestions =
        count === 'all'
          ? candidates.length
          : Math.min(Number(count), candidates.length)
      pool = shuffle(candidates).slice(0, numberOfQuestions)
    }

    pool = pool.map((q) => {
      const order = shuffleOptions ? shuffle(LETTERS) : [...LETTERS]
      return {
        ...q,
        displayOptions: order.map((source) => ({
          source,
          text: q.options[source],
        })),
      }
    })

    setSession({
      items: pool,
      index: 0,
      answers: {},
      done: false,
      mixMode,
    })
  }

  if (!session) {
    return <Setup onStart={start} />
  }

  if (session.done) {
    return <Result session={session} onRestart={() => setSession(null)} />
  }

  return (
    <Quiz
      key={session.index}
      session={session}
      setSession={setSession}
      onQuit={() => setSession(null)}
    />
  )
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
