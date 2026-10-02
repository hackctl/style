import { useEffect, useMemo, useState } from 'react'
import { GROUPS, SECTIONS } from './data/catalog.jsx'
import { ACCENTS, THEMES, ThemeProvider, useTheme } from './lib/theme.jsx'

const REPO_URL = "https://github.com/hackctl/style"

function Shell() {
  const { theme, setTheme, ai, setAi } = useTheme()
  const [q,setQ] = useState("")
  const [open,setOpen] = useState(false)
  const [active,setActive] = useState(()=>window.location.hash.replace("#","") || "color")
  const [mode,setMode] = useState("view")
  const [copied,setCopied] = useState(false)
  useEffect(()=>{
    const h=()=>{const id=window.location.hash.replace("#","");if(id&&SECTIONS.some(s=>s.id===id)){setActive(id);setMode("view");setCopied(false)};setOpen(false)};
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
    {open?<div className="scrim-nav" onClick={()=>setOpen(false)} />:null}
    <aside className={"side"+(open?" open":"")}>
      <div className="side-head">
        <div style={{display:"flex",alignItems:"center",gap:"var(--sp2)"}}>
          <span className="brand">SYS/UI · library</span>
          <span style={{flex:1}} />
          <a className="lnk" href={REPO_URL} target="_blank" rel="noreferrer">Repo ↗</a>
        </div>
        <span className="search-wrap"><input className="side-search" placeholder="Search" value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>{if(e.key==="Escape")q?setQ(""):setOpen(false)}} aria-label="Search components" />{q?<button type="button" className="search-x" onClick={()=>setQ("")} aria-label="Clear search">×</button>:null}</span>
        {q?<span className="meta">{filtered.length}/{SECTIONS.length}</span>:null}
        <div><div className="lab" style={{marginBottom:4}}>Theme</div><div className="seg lab" role="group" aria-label="Theme">{THEMES.map(t=><button key={t} aria-pressed={t===theme} onClick={()=>setTheme(t)}>{t}</button>)}</div></div>
        <div><div className="lab" style={{marginBottom:4}}>Accent</div><div className="dots" role="group" aria-label="Accent">{ACCENTS.map((c,i)=><button key={c[0]} className="sw" aria-label={c[0]} aria-pressed={i===ai} style={{background:theme==="white"?c[4]:c[1]}} onClick={()=>setAi(i)} />)}</div></div>
      </div>
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
        <button className="b s sm menu-btn" onClick={()=>setOpen(!open)} aria-label="Menu" aria-expanded={open}><span className="burger" aria-hidden="true"><i /><i /><i /></span></button>
        <span className="meta">{GROUPS.find(g=>g.id===sec.group)?.label} / {sec.name}</span>
        <span className="grow" style={{flex:1}} />
        <span className="meta">{theme} · {ACCENTS[ai][0]}</span>
        <a className="lnk" href={REPO_URL} target="_blank" rel="noreferrer">Repo ↗</a>
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
