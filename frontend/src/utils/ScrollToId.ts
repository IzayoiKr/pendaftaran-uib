export default function scrollToId(id: string) {
    if (typeof window === "undefined") return;
    document
        .getElementById(id)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
}
