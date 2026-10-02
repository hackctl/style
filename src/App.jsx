import { useEffect, useMemo, useState } from 'react'
import { GROUPS, SECTIONS } from './data/catalog.jsx'
import { ACCENTS, THEMES, ThemeProvider, useTheme } from './lib/theme.jsx'

const REPO_URL = "https://github.com/hackctl/style"
const HACKCTL_URL = "https://hackctl.com"

const GH_ICON = <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>

function Shell() {
  const { theme, setTheme, ai, setAi } = useTheme()
  const [q,setQ] = useState("")
  const [active,setActive] = useState(()=>window.location.hash.replace("#","") || "color")
  const [mode,setMode] = useState("view")
  const [copied,setCopied] = useState(false)
  useEffect(()=>{
    const h=()=>{const id=window.location.hash.replace("#","");if(id&&SECTIONS.some(s=>s.id===id)){setActive(id);setMode("view");setCopied(false)}};
    window.addEventListener("hashchange",h);return()=>window.removeEventListener("hashchange",h)
  },[])
  const go=id=>{setActive(id);setMode("view");setCopied(false);window.location.hash=id}
  const copy=async()=>{try{await navigator.clipboard.writeText(sec.code);setCopied(true);setTimeout(()=>setCopied(false),1500)}catch{setCopied(false)}}
  const filtered=useMemo(()=>SECTIONS.filter(s=>(s.name+" "+s.group).toLowerCase().includes(q.toLowerCase())),[q])
  const sec=SECTIONS.find(s=>s.id===active)||SECTIONS[0]
  const idx=SECTIONS.findIndex(s=>s.id===sec.id)
  const prev=SECTIONS[idx-1], next=SECTIONS[idx+1]
  const Demo=sec.demo
  return <div className="app">
    <aside className="side">
      <nav className="side-nav" aria-label="Components">
        {GROUPS.map((g,gi)=>{
          const items=filtered.filter(s=>s.group===g.id)
          if(!items.length)return null
          return <div key={g.id} className="nav-group" data-g={g.id}>
            <span className="nav-head"><span className="meta">{String(gi+1).padStart(2,"0")}</span><span className="lab" style={{color:"var(--text)"}}>{g.label}</span><span className="bdg">{items.length}</span></span>
            {items.map((s,ii)=><a key={s.id} className="nlink" data-g={g.id} href={"#"+s.id} aria-current={s.id===sec.id?"page":undefined} onClick={e=>{e.preventDefault();go(s.id)}}><span className="mk" aria-hidden="true" /><span className="fill">{s.name}</span><span className="n">{String(ii+1).padStart(2,"0")}</span></a>)}
          </div>
        })}
        {!filtered.length?<span className="meta">No matches for “{q}”. <button type="button" className="lnk" onClick={()=>setQ("")}>Reset</button></span>:null}
      </nav>
    </aside>
    <div style={{minWidth:0}}>
      <div className="topbar">
        <a className="gh" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="GitHub repository">{GH_ICON}</a>
        <a className="brand-logo" href={HACKCTL_URL} target="_blank" rel="noreferrer" aria-label="hackctl"><img src="/hackctl-logo.png" alt="hackctl" /></a>
        <span className="search-wrap top-search"><input className="side-search" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Escape"&&q)setQ("")}} aria-label="Search components" />{q?<button type="button" className="search-x" onClick={()=>setQ("")} aria-label="Clear search">×</button>:null}</span>
        {q?<span className="meta">{filtered.length}/{SECTIONS.length}</span>:null}
        <span className="seg" role="group" aria-label="Theme">{THEMES.map(t=><button key={t} aria-pressed={t===theme} onClick={()=>setTheme(t)}>{t}</button>)}</span>
        <span className="dots" role="group" aria-label="Accent">{ACCENTS.map((c,i)=><button key={c[0]} className="sw" aria-label={c[0]} aria-pressed={i===ai} style={{background:theme==="white"?c[4]:c[1]}} onClick={()=>setAi(i)} />)}</span>
      </div>
      <main className="main">
        <div className="doc-head" key={sec.id}>
          <span className="lab">{GROUPS.find(g=>g.id===sec.group)?.label}</span>
          <h1 className="d">{sec.name}</h1>
        </div>
        <section className="block" aria-label="Demo">
          <div className="demo" key={sec.id}>
            <div className="demo-head">
              <div className="segc sm" role="group" aria-label="Panel view">
                <button type="button" aria-pressed={mode==="view"} onClick={()=>setMode("view")}>View</button>
                <button type="button" aria-pressed={mode==="code"} onClick={()=>setMode("code")}>Code</button>
              </div>
              <span style={{flex:1}} />
              {mode==="code"?<button type="button" className="b s sm" onClick={copy}>{copied?"Copied":"Copy"}</button>:null}
            </div>
            {mode==="view"?
              <div className="demo-view"><Demo /></div>
            :
              <div className="demo-code" style={{borderTop:0}}>
                <pre>{sec.code}</pre>
              </div>
            }
          </div>
        </section>
        <footer className="doc-foot"><span className="meta">{prev?<a className="lnk" href={"#"+prev.id} onClick={e=>{e.preventDefault();go(prev.id)}}>← {prev.name}</a>:"—"} · {next?<a className="lnk" href={"#"+next.id} onClick={e=>{e.preventDefault();go(next.id)}}>{next.name} →</a>:"—"}</span></footer>
      </main>
    </div>
  </div>
}

export default function App(){return <ThemeProvider><Shell /></ThemeProvider>}
