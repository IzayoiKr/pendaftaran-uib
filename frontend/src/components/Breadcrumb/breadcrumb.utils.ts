import { BREADCRUMB_LABELS } from "@/constants/breadcrumbs";

import type { BreadcrumbItem } from "./types";

interface BuildBreadcrumbsOptions {
  pathname: string;
  lastLabel?: string;
}

export function buildBreadcrumbs({
  pathname,
  lastLabel,
}: BuildBreadcrumbsOptions): BreadcrumbItem[] {
  const segments = pathname
    .split("/")
    .filter(Boolean);

  return [
    {
      label: "Beranda",
      href: "/",
    },

    ...segments.map((segment, index) => {
      const href =
        "/" +
        segments
          .slice(0, index + 1)
          .join("/");

      const isLast =
        index === segments.length - 1;

      const fallbackLabel = segment
        .split("-")
        .map(
          (word) =>
            word.charAt(0).toUpperCase() +
            word.slice(1),
        )
        .join(" ");

      return {
        label:
          isLast && lastLabel
            ? lastLabel
            : BREADCRUMB_LABELS[
                segment
              ] ?? fallbackLabel,

        href: isLast
          ? undefined
          : href,
      };
    }),
  ];
}