import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import questions from './data/questions.json'
import './styles.css'

const LETTERS=['A','B','C','D']
const FIELDS=[...new Set(questions.map(q=>q.field))]
const shuffle=a=>{const x=[...a];for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]]}return x}

function Setup({onStart}){
 const [fields,setFields]=useState(FIELDS)
 const [count,setCount]=useState('25')
 const [shuffleOptions,setShuffleOptions]=useState(true)
 const available=questions.filter(q=>fields.includes(q.field)).length
 const toggle=f=>setFields(v=>v.includes(f)?v.filter(x=>x!==f):[...v,f])
 return <main className="shell"><section className="hero"><span className="eyebrow">養成講座 修了試験対策</span><h1>総合400問</h1><p>4分野から出題範囲と問題数を選び、スマートフォンでも学習できます。</p></section>
 <section className="card setup"><h2>出題設定</h2><fieldset><legend>分野</legend><div className="checks">{FIELDS.map(f=><label key={f}><input type="checkbox" checked={fields.includes(f)} onChange={()=>toggle(f)}/><span>{f}</span></label>)}</div></fieldset>
 <fieldset><legend>問題数</legend><select value={count} onChange={e=>setCount(e.target.value)}><option value="10">10問</option><option value="25">25問</option><option value="50">50問</option><option value="100">100問</option><option value="all">選択分野の全問</option></select></fieldset>
 <label className="switch"><input type="checkbox" checked={shuffleOptions} onChange={e=>setShuffleOptions(e.target.checked)}/><span>選択肢の順番もランダムにする</span></label>
 <p className="muted">対象：{available}問</p><button className="primary" disabled={!available} onClick={()=>onStart({fields,count,shuffleOptions})}>問題を開始</button></section></main>
}

function App(){
 const [session,setSession]=useState(null)
 const start=cfg=>{
  let pool=shuffle(questions.filter(q=>cfg.fields.includes(q.field)))
  const n=cfg.count==='all'?pool.length:Math.min(Number(cfg.count),pool.length)
  pool=pool.slice(0,n).map(q=>{
   const order=cfg.shuffleOptions?shuffle(LETTERS):LETTERS
   return {...q,displayOptions:order.map(source=>({source,text:q.options[source]}))}
  })
  setSession({items:pool,index:0,answers:{},done:false})
 }
 if(!session) return <Setup onStart={start}/>
 if(session.done) return <Result session={session} retry={()=>setSession(null)}/>
 const q=session.items[session.index], selected=session.answers[q.id]
 const answer=source=>setSession(s=>({...s,answers:{...s.answers,[q.id]:source}}))
 const next=()=>setSession(s=>s.index===s.items.length-1?{...s,done:true}:{...s,index:s.index+1})
 return <main className="shell"><header className="quizHead"><div><span className="eyebrow">{q.field}</span><strong>{session.index+1} / {session.items.length}</strong></div><div className="progress"><i style={{width:`${(session.index+1)/session.items.length*100}%`}}/></div></header>
 <section className="card question"><div className="meta"><span>{q.theme}</span><span>{q.difficulty}</span></div><h1>{q.question}</h1><div className="options">{q.displayOptions.map((o,i)=><button key={o.source} className={selected===o.source?'selected':''} onClick={()=>answer(o.source)}><b>{LETTERS[i]}</b><span>{o.text}</span></button>)}</div>
 <div className="actions"><button className="ghost" onClick={()=>setSession(null)}>中断</button><button className="primary" disabled={!selected} onClick={next}>{session.index===session.items.length-1?'採点する':'次の問題'}</button></div></section></main>
}

function Result({session,retry}){
 const correct=session.items.filter(q=>session.answers[q.id]===q.answer).length
 const pct=Math.round(correct/session.items.length*100)
 const [filter,setFilter]=useState('wrong')
 const shown=useMemo(()=>session.items.filter(q=>filter==='all'||session.answers[q.id]!==q.answer),[session,filter])
 return <main className="shell"><section className="hero resultHero"><span className="eyebrow">学習結果</span><h1>{correct} / {session.items.length}問</h1><p>正答率 {pct}%</p><button className="primary light" onClick={retry}>条件を変えて再挑戦</button></section>
 <section className="reviewHead"><h2>復習</h2><div><button className={filter==='wrong'?'tab active':'tab'} onClick={()=>setFilter('wrong')}>誤答のみ</button><button className={filter==='all'?'tab active':'tab'} onClick={()=>setFilter('all')}>全問</button></div></section>
 {shown.length===0?<section className="card empty">全問正解です。</section>:shown.map((q,i)=>{const picked=session.answers[q.id],ok=picked===q.answer;return <article className="card review" key={q.id}><span className={ok?'status ok':'status ng'}>{ok?'正解':'不正解'}</span><h3>{i+1}. {q.question}</h3><p><b>あなたの回答：</b>{picked ? q.options[picked] : '未回答'}</p><p><b>正答：</b>{q.answer}. {q.options[q.answer]}</p><div className="explain">{q.explanation}</div></article>})}</main>
}
createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>)
