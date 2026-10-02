import { Children, useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '../lib/utils.js'

/* Figma auto-layout primitives: direction + gap + padding + hug/fill */
export function Stack({ gap="var(--sp4)", pad="0", align="stretch", children, style }) {
  return <div className="frame-v" style={{ "--gap": gap, "--pad": pad, "--align": align, ...style }}>{children}</div>
}
export function Cluster({ gap="var(--sp3)", pad="0", align="center", children, style }) {
  return <div className="frame-h" style={{ "--gap": gap, "--pad": pad, "--align": align, ...style }}>{children}</div>
}

const BTN_ALIAS = { default:"p", primary:"p", secondary:"s", outline:"s", ghost:"g", link:"g", destructive:"d", danger:"d", "danger-outline":"do", p:"p", s:"s", g:"g", d:"d", do:"do" }
export function Button({ variant="p", size="", icon=false, block=false, loading=false, className="", children, ...rest }) {
  const v = BTN_ALIAS[variant] || "p"
  const cls = cn("b", v, size, icon && "ic", block && "blk", className)
  return <button type="button" data-slot="button" className={cls} disabled={loading || rest.disabled} {...rest}>{loading ? <span className="spin" aria-hidden="true" /> : null}{children}</button>
}
export function LinkButton({ children, ...rest }) { return <a className="lnk" {...rest}>{children}</a> }
export function CountBadge({ children }) { return <span className="bdg">{children}</span> }
export function Chip({ tone="", children }) { return <span className={"chip "+tone}>{children}</span> }
export function Kbd({ children }) { return <kbd className="k">{children}</kbd> }
export function Segmented({ options, value, onChange, label }) {
  return <div className="segc" role="group" aria-label={label}>{options.map(o => <button key={o} type="button" aria-pressed={o===value} onClick={()=>onChange(o)}>{o}</button>)}</div>
}
export function SplitButton({ children, onOptions, optionsLabel="More options" }) {
  return <span className="split"><button type="button" className="b p">{children}</button><button type="button" className="b p" aria-label={optionsLabel} onClick={onOptions}>▾</button></span>
}
export function Field({ label, help, error, children }) {
  const id = useId()
  const child = Array.isArray(children) ? children[0] : children
  return <div className="field"><label className="lab" style={{color:"var(--text)"}} htmlFor={id}>{label}</label>{child && child.props ? {...child, props:{...child.props, id}} : children}{error ? <span className="help err">{error}</span> : help ? <span className="help">{help}</span> : null}</div>
}
export function TextInput(props) { return <input data-slot="input" className={cn("in", (props["data-err"]||props["aria-invalid"]) && "err")} {...props} /> }
export function Textarea(props) { return <textarea data-slot="textarea" className="in" {...props} /> }
/* Self-built select — shadcn-style composition, no native browser UI */
export function SelectItem() { return null }
export function Select({ value, defaultValue, onValueChange, placeholder="Select", label="Select", children }) {
  const items = Children.toArray(children).filter(c=>c && c.props).map(c=>({ value:c.props.value, label:c.props.children, disabled:!!c.props.disabled }))
  const [internal,setInternal] = useState(defaultValue)
  const cur = value !== undefined ? value : internal
  const [open,setOpen] = useState(false)
  const [hl,setHl] = useState(-1)
  const [pos,setPos] = useState(null)
  const baseId = useId()
  const ref = useRef(null)
  const btnRef = useRef(null)
  const listRef = useRef(null)
  const current = items.find(i=>String(i.value)===String(cur))
  const choose = v => { if(value===undefined)setInternal(v); onValueChange && onValueChange(v); setOpen(false); setPos(null); btnRef.current && btnRef.current.focus() }
  const measure = () => { const r = btnRef.current && btnRef.current.getBoundingClientRect(); if(r) setPos({ top:r.bottom+4, left:r.left, width:r.width }) }
  useEffect(()=>{ if(!open)return
    measure()
    const close=e=>{ const t=e.target; if(ref.current&&ref.current.contains(t))return; if(listRef.current&&listRef.current.contains(t))return; setOpen(false); setPos(null) }
    const keys=e=>{
      if(e.key==="Escape"){ setOpen(false); setPos(null); btnRef.current && btnRef.current.focus() }
      else if(e.key==="ArrowDown"){ e.preventDefault(); setHl(h=>Math.min(items.length-1,h+1)) }
      else if(e.key==="ArrowUp"){ e.preventDefault(); setHl(h=>Math.max(0,h-1)) }
      else if(e.key==="Home"){ e.preventDefault(); setHl(0) }
      else if(e.key==="End"){ e.preventDefault(); setHl(items.length-1) }
      else if(e.key==="Enter"&&hl>=0&&items[hl]&&!items[hl].disabled){ e.preventDefault(); choose(items[hl].value) }
    }
    const reposition=()=>measure()
    window.addEventListener("pointerdown",close); window.addEventListener("keydown",keys)
    window.addEventListener("scroll",reposition,true); window.addEventListener("resize",reposition)
    return ()=>{ window.removeEventListener("pointerdown",close); window.removeEventListener("keydown",keys); window.removeEventListener("scroll",reposition,true); window.removeEventListener("resize",reposition) }
  },[open,hl,items.length]);
  const openMenu = () => { measure(); setOpen(true); setHl(items.findIndex(i=>String(i.value)===String(cur))) }
  return <span ref={ref} className="sel" data-slot="select">
    <button ref={btnRef} type="button" className="sel-btn" data-slot="select-trigger" data-open={open} aria-haspopup="listbox" aria-expanded={open}
      aria-activedescendant={open&&hl>=0?`${baseId}-opt-${hl}`:undefined}
      onClick={()=>open?(setOpen(false),setPos(null)):openMenu()}
      onKeyDown={e=>{ if(["ArrowDown","ArrowUp","Enter"," "].includes(e.key)){ e.preventDefault(); if(!open)openMenu() } }}>
      {current ? <span>{current.label}</span> : <span className="ph">{placeholder}</span>}<span className="chev" aria-hidden="true">▾</span>
    </button>
    {open && pos && createPortal(
      <span ref={listRef} className="sel-list" data-slot="select-content" role="listbox" aria-label={label} tabIndex={-1}
        style={{ position:"fixed", top:pos.top, left:pos.left, width:pos.width }}>
        {items.map((it,i)=><button key={String(it.value)} id={`${baseId}-opt-${i}`} type="button" role="option" aria-selected={String(it.value)===String(cur)} data-active={hl===i} disabled={it.disabled} className="sel-opt" data-slot="select-item" onMouseEnter={()=>setHl(i)} onClick={()=>!it.disabled&&choose(it.value)}>{it.label}{String(it.value)===String(cur)&&<span className="tick" aria-hidden="true">✓</span>}</button>)}
      </span>, document.body)}
  </span>
}
export function Checkbox({ children, disabled, ...rest }) { return <label className="check" data-slot="checkbox" style={disabled?{opacity:.4}:undefined}><input type="checkbox" disabled={disabled} {...rest} /><span className="data">{children}</span></label> }
export function Radio({ name, children, disabled, ...rest }) { return <label className="radio" data-slot="radio" style={disabled?{opacity:.4}:undefined}><input type="radio" name={name} disabled={disabled} {...rest} /><span className="data">{children}</span></label> }
export function Switch({ checked, onChange, children, label, disabled }) {
  return <button type="button" className="switch" data-slot="switch" role="switch" aria-checked={!!checked} aria-label={label||children} disabled={disabled} style={disabled?{opacity:.4}:undefined} onClick={()=>onChange(!checked)}><span className="tr" /><span className="data">{children}</span></button>
}
export function Slider(props) { return <input type="range" className="slider" {...props} /> }
export function Progress({ value }) { return <div className="prog" data-slot="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={"Progress "+value+"%"}><i style={{width:value+"%"}} /></div> }
export function Skeleton({ w="100%", h=12 }) { return <div className="skel" aria-hidden="true" style={{width:w,height:h}} /> }
export function Avatar({ children="S/" }) { return <span className="av" aria-hidden="true">{children}</span> }
export function Separator() { return <hr className="sep" /> }
export function Card({ label, children }) { return <div className="card" data-slot="card">{label ? <span className="lab">{label}</span> : null}{children}</div> }
export function Panel({ title, meta, footer, inset=false, children }) {
  return <div className={"panel"+(inset?" inset":"")}><div className="panel-h"><span className="lab" style={{color:"var(--text)"}}>{title}</span><span className="grow" style={{flex:1}} />{meta}</div><div className="panel-b">{children}</div>{footer ? <div className="panel-f">{footer}</div> : null}</div>
}
export function Stat({ label, value, delta }) { return <div className="stat"><span className="lab">{label}</span><span className="h3">{value}</span><span className="meta">{delta}</span></div> }
const ALERT_ICON = { default:"◷", info:"i", ok:"✓", warn:"!", err:"×" }
/* shadcn-style alert: quiet surface, icon + title + description */
export function Alert({ tone="", variant, title, children }) {
  const t = variant === "destructive" ? "err" : (variant || tone || "default")
  return <div className="alert" data-slot="alert" data-tone={t} role="alert"><span className="a-ic" aria-hidden="true">{ALERT_ICON[t] || "◷"}</span><div>{title && <div className="a-ti" data-slot="alert-title">{title}</div>}<div className="a-de" data-slot="alert-description">{children}</div></div></div>
}
export function AlertTitle({ children }) { return <div className="a-ti" data-slot="alert-title">{children}</div> }
export function AlertDescription({ children }) { return <div className="a-de" data-slot="alert-description">{children}</div> }
export function Breadcrumb({ items, hrefFor }) {
  const href = hrefFor || (()=>undefined)
  return <nav className="crumbs meta" aria-label="Breadcrumb">{items.map((t,i)=>{const last=i===items.length-1;const h=href(t,i);return <span key={t} style={{display:"contents"}}>{i>0?<span aria-hidden="true">/</span>:null}{last||!h?<span aria-current={last?"page":undefined}>{t}</span>:<a href={h}>{t}</a>}</span>})}</nav>
}
export function Tabs({ tabs, value, onChange }) {
  return <><div className="tabs" data-slot="tabs" role="tablist" aria-label="Tabs">{tabs.map(t=><button key={t.id} type="button" role="tab" aria-selected={t.id===value} onClick={()=>onChange(t.id)}>{t.label}</button>)}</div><div className="data" style={{paddingTop:"var(--sp3)"}}>{tabs.find(t=>t.id===value)?.body}</div></>
}
export function Accordion({ title, children, open }) { return <details className="acc" open={open}><summary><span className="lab" style={{color:"var(--text)"}}>{title}</span><span className="caret" aria-hidden="true">›</span></summary><div className="acc-b">{children}</div></details> }
export function Steps({ steps, current }) {
  return <div className="steps">{steps.map((s,i)=><div key={s} className={"step"+(i<current?" done":i===current?" now":"")}><span className="lab" style={i===current?{color:"var(--bright)"}:i<current?{color:"var(--acc)"}:undefined}>{i+1} · {i<current?"Done":i===current?"Now":"Next"}</span><span className="data">{s}</span></div>)}</div>
}
export function DataTable({ cols, rows, caption }) {
  return <div style={{overflowX:"auto"}}><table className="tbl">{caption?<caption className="meta" style={{textAlign:"left",paddingBottom:"var(--sp2)"}}>{caption}</caption>:null}<thead><tr>{cols.map(c=><th key={c} scope="col">{c}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{r.map((c,j)=><td key={j}>{c}</td>)}</tr>)}</tbody></table></div>
}
export function Pagination({ page, total, onChange }) {
  return <div className="pgn" role="navigation" aria-label="Pagination"><button type="button" onClick={()=>onChange(Math.max(1,page-1))} aria-label="Previous page">←</button>{Array.from({length:total},(_,i)=>i+1).map(n=><button key={n} type="button" aria-current={n===page?"page":undefined} onClick={()=>onChange(n)}>{n}</button>)}<button type="button" onClick={()=>onChange(Math.min(total,page+1))} aria-label="Next page">→</button></div>
}
export function Empty({ title, body, action }) { return <div className="empty"><span className="lab">{title}</span><span className="small">{body}</span>{action}</div> }
export function Dialog({ title, open, onClose, children, footer }) {
  useEffect(()=>{const h=e=>{if(e.key==="Escape")onClose()};if(open)window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h)},[open,onClose]);
  if(!open) return null
  return <div className="scrim" onClick={onClose}><div className="dialog" data-slot="dialog" role="dialog" aria-modal="true" aria-label={title} onClick={e=>e.stopPropagation()}><div className="dialog-h"><span className="lab" style={{color:"var(--text)"}}>{title}</span></div><div className="dialog-b">{children}</div><div className="dialog-f">{footer}<button type="button" className="b s sm" onClick={onClose}>Close</button></div></div></div>
}
export function Sheet({ open, onClose, title, children }) {
  if(!open) return null
  return <div className="sheet-wrap" onClick={onClose}><aside className="sheet" data-slot="sheet" onClick={e=>e.stopPropagation()} aria-label={title}><span className="lab">{title}</span>{children}<button type="button" className="b s sm" onClick={onClose}>Close panel</button></aside></div>
}
export function Tooltip({ label, children }) {
  const [show,setShow]=useState(false)
  const [pos,setPos]=useState(null)
  const ref=useRef(null)
  const measure=()=>{const r=ref.current&&ref.current.getBoundingClientRect();if(r)setPos({top:r.top-8,left:r.left+r.width/2})}
  const on=()=>{measure();setShow(true)}
  const off=()=>{setShow(false);setPos(null)}
  return <span ref={ref} className="tip" data-slot="tooltip" onMouseEnter={on} onMouseLeave={off} onFocus={on} onBlur={off}>{children}{show&&pos&&createPortal(<span className="bubble bubble-float" role="tooltip" style={{position:"fixed",top:pos.top,left:pos.left}}>{label}</span>,document.body)}</span>
}
export function Menu({ label, items, value, onSelect }) {
  const [open,setOpen]=useState(false)
  const [pos,setPos]=useState(null)
  const ref=useRef(null)
  const btnRef=useRef(null)
  const listRef=useRef(null)
  const measure=()=>{const r=btnRef.current&&btnRef.current.getBoundingClientRect();if(r)setPos({top:r.bottom+8,left:Math.min(r.left,window.innerWidth-196)})}
  useEffect(()=>{if(!open)return;measure();
    const close=e=>{const t=e.target;if(ref.current&&ref.current.contains(t))return;if(listRef.current&&listRef.current.contains(t))return;setOpen(false);setPos(null)};
    const esc=e=>{if(e.key==="Escape"){setOpen(false);setPos(null);btnRef.current&&btnRef.current.focus()}};
    const reposition=()=>measure();
    window.addEventListener("pointerdown",close);window.addEventListener("keydown",esc);
    window.addEventListener("scroll",reposition,true);window.addEventListener("resize",reposition);
    return ()=>{window.removeEventListener("pointerdown",close);window.removeEventListener("keydown",esc);window.removeEventListener("scroll",reposition,true);window.removeEventListener("resize",reposition)}},[open]);
  return <span ref={ref} className="pop" data-slot="dropdown-menu"><button ref={btnRef} type="button" className="b s" aria-haspopup="menu" aria-expanded={open} onClick={()=>open?(setOpen(false),setPos(null)):(measure(),setOpen(true))}>{label} ▾</button>{open&&pos&&createPortal(<span ref={listRef} className="menu menu-float" role="menu" style={{position:"fixed",top:pos.top,left:pos.left}}>{items.map(t=><button key={t} type="button" role="menuitemradio" aria-checked={t===value} onClick={()=>{setOpen(false);setPos(null);onSelect&&onSelect(t);btnRef.current&&btnRef.current.focus()}}>{t}{t===value&&<span aria-hidden="true" style={{marginLeft:"auto",color:"var(--acc)"}}>✓</span>}</button>)}</span>,document.body)}</span>
}
export function Toasts({ items }) { return <div className="toast-stack" aria-live="polite">{items.map(t=><div key={t.id} className={"toast "+(t.tone||"")}>{t.text}</div>)}</div> }
