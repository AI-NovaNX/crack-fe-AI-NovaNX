export type Theme = "dark" | "light";
export const THEME_EVENT = "nexread-theme-change";
export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  document.documentElement.style.colorScheme = theme;
}
export function getTheme(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
export function setTheme(theme: Theme) {
  applyTheme(theme);
  try { localStorage.setItem("theme", theme); } catch { /* Theme still works when storage is blocked. */ }
  window.dispatchEvent(new Event(THEME_EVENT));
}
export function subscribeTheme(update: () => void) {
  function sync(event: StorageEvent) {
    if (event.key !== "theme" && event.key !== null) return;
    applyTheme(event.newValue === "light" ? "light" : "dark");
    update();
  }
  window.addEventListener(THEME_EVENT, update);
  window.addEventListener("storage", sync);
  return () => { window.removeEventListener(THEME_EVENT, update); window.removeEventListener("storage", sync); };
}
// Run before paint on every route, including authentication pages.
export const themeInitScript = `(function(){var t='dark';try{if(localStorage.getItem('theme')==='light')t='light';}catch(e){}document.documentElement.classList.toggle('dark',t==='dark');document.documentElement.style.colorScheme=t;})();`;
