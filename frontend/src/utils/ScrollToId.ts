export default function scrollToId(id: string) {
  if (typeof window === "undefined") return;

  const el = document.getElementById(id);
  if (!el) return;

  const header =
    document.querySelector<HTMLElement>("header");

  const offset =
    (header?.offsetHeight ?? 80) + 32;

  window.scrollTo({
    top:
      el.getBoundingClientRect().top +
      window.scrollY -
      offset,
    behavior: "smooth",
  });
}