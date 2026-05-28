import Link from "next/link";
import type { BreadcrumbItem } from "./types";

interface BreadcrumbNavProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function BreadcrumbNav({
    items,
    className,
}: BreadcrumbNavProps) {
    return (
        <nav aria-label="Breadcrumb" className={className}>
            {items.map((item, index) => (
                <span key={index}>
                    {item.href ? (
                        <Link href={item.href}>{item.label}</Link>
                    ) : (
                        <span>{item.label}</span>
                    )}

                    {index < items.length - 1 && (
                        <span aria-hidden="true"> › </span>
                    )}
                </span>
            ))}
        </nav>
    );
}
