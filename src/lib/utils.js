// shadcn-style classnames helper (clsx + tailwind-merge equivalent for token classes)
export function cn(...xs) {
  return xs.flat(Infinity).filter(Boolean).join(" ")
}
