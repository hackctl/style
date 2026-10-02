import { createContext, useContext, useEffect, useState } from 'react'

export const ACCENTS = [
  ["Green","#5ee08a","#1f3125","#0d1f13","#0f7a3a","#e7f0eb"],
  ["Blue","#5b9dff","#1f2836","#0d1624","#2260cf","#e9eef7"],
  ["Red","#ff5555","#361e1e","#240c0c","#c92a2a","#f6e9e9"],
  ["Yellow","#f2c94c","#342e1d","#221c0b","#7f5f00","#f0eee6"],
  ["Orange","#ff9640","#36271b","#241509","#a84c00","#f3ece6"],
  ["Purple","#b48cff","#2b2636","#191424","#6a42d0","#eeebf7"],
  ["Pink","#ff7ac6","#36232e","#24111c","#b82c74","#f5eaef"],
]
export const THEMES = ["grey","black","white"]
const sol = (c, theme) => theme === "white" ? c[4] : c[1]
const dim = (c, theme) => theme === "white" ? c[5] : theme === "black" ? c[3] : c[2]

const ThemeCtx = createContext(null)
export const useTheme = () => useContext(ThemeCtx)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("black")
  const [ai, setAi] = useState(0)
  useEffect(() => {
    const R = document.documentElement
    R.dataset.theme = theme
    const a = ACCENTS[ai]
    const set = (k,v) => R.style.setProperty(k,v)
    set("--acc", sol(a, theme)); set("--acc-dim", dim(a, theme))
    const map = [["ok",0],["info",1],["err",2],["warn",3]]
    map.forEach(([k,i]) => { set("--"+k, sol(ACCENTS[i], theme)); set("--"+k+"-d", dim(ACCENTS[i], theme)) })
  }, [theme, ai])
  return <ThemeCtx.Provider value={{ theme, setTheme, ai, setAi }}>{children}</ThemeCtx.Provider>
}
