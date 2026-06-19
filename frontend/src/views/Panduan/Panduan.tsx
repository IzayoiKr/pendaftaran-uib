"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { panduanPhases } from "@/constants/panduan";
import type { PanduanIconName } from "@/constants/panduan";
import clsx from "clsx";
import {
    GuideCircleCheckIcon,
    GuideClipboardListIcon,
    GuideEditIcon,
    GuideFileTextIcon,
    GuideRefreshIcon,
    GuideSwitchHorizontalIcon,
    GuideUploadIcon,
    GuideUserPlusIcon,
} from "@/components/Icons/Icons";
import GuideCard from "./GuideCard";
import styles from "./Panduan.module.scss";

const HEADER_OFFSET = 88;

const ICON_MAP: Record<PanduanIconName, React.ReactNode> = {
    "ti-user-plus": <GuideUserPlusIcon />,
    "ti-file-text": <GuideFileTextIcon />,
    "ti-edit": <GuideEditIcon />,
    "ti-upload": <GuideUploadIcon />,
    "ti-circle-check": <GuideCircleCheckIcon />,
    "ti-refresh": <GuideRefreshIcon />,
    "ti-clipboard-list": <GuideClipboardListIcon />,
    "ti-switch-horizontal": <GuideSwitchHorizontalIcon />,
};

const formatPhase = (num: number) => String(num).padStart(2, "0");

export default function Panduan() {
    // Scoped to the "panduan" namespace — keys no longer need the "panduan." prefix
    const t = useTranslations("panduan");

    const [activeId, setActiveId] = useState(panduanPhases[0].id);

    const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

    const navItems = useMemo(
        () =>
            panduanPhases.map((phase) => ({
                id: phase.id,
                number: formatPhase(phase.phaseNumber),
                title: t(phase.titleKey),
                label: t(phase.phaseLabelKey),
            })),
        [t],
    );

    const handleScroll = useCallback(() => {
        const currentId =
            [...panduanPhases].reverse().find((phase) => {
                const top =
                    sectionRefs.current[phase.id]?.getBoundingClientRect().top;
                return top !== undefined && top <= HEADER_OFFSET;
            })?.id ?? panduanPhases[0].id;

        setActiveId(currentId);
    }, []);

    useEffect(() => {
        handleScroll();
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [handleScroll]);

    const scrollToSection = useCallback((id: string) => {
        sectionRefs.current[id]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    }, []);

    return (
        <div className={styles.page}>
            <div className={styles.layout}>
                <aside
                    className={styles.sidebar}
                    aria-label={t("nav.ariaLabel")}
                >
                    <p className={styles.sidebarLabel}>{t("nav.heading")}</p>

                    <nav className={styles.sidebarNav}>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => scrollToSection(item.id)}
                                aria-current={
                                    activeId === item.id ? true : undefined
                                }
                                className={clsx(
                                    styles.sidebarLink,
                                    activeId === item.id && styles.isActive,
                                )}
                            >
                                <div className={styles.sidebarBadge}>
                                    {item.number}
                                </div>

                                <div className={styles.sidebarLinkText}>
                                    <span className={styles.sidebarPhase}>
                                        {item.label}
                                    </span>

                                    <span className={styles.sidebarTitle}>
                                        {item.title}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                <main className={styles.content}>
                    {panduanPhases.map((phase, index) => (
                        <section
                            key={phase.id}
                            id={phase.id}
                            className={styles.phaseSection}
                            aria-labelledby={`phase-heading-${phase.id}`}
                            ref={(el) => {
                                sectionRefs.current[phase.id] = el;
                            }}
                        >
                            {index > 0 && (
                                <div
                                    aria-hidden="true"
                                    className={styles.phaseSep}
                                >
                                    <div className={styles.sepLine} />

                                    <div className={styles.sepDot}>
                                        <i className="ti ti-dots" />
                                    </div>

                                    <div className={styles.sepLine} />
                                </div>
                            )}

                            <div className={styles.phaseHeader}>
                                <div className={styles.phaseNum}>
                                    <span>
                                        {formatPhase(phase.phaseNumber)}
                                    </span>
                                </div>

                                <div className={styles.phaseInfo}>
                                    <p className={styles.phaseLabel}>
                                        {t(phase.phaseLabelKey)}
                                    </p>

                                    <h2
                                        id={`phase-heading-${phase.id}`}
                                        className={styles.phaseTitle}
                                    >
                                        {t(phase.titleKey)}
                                    </h2>

                                    <p className={styles.phaseSub}>
                                        {t(phase.subtitleKey)}
                                    </p>
                                </div>
                            </div>

                            <div className={styles.cardsGrid}>
                                {phase.items.map((item) => (
                                    <GuideCard
                                        key={item.id}
                                        step={item.step}
                                        title={t(item.titleKey)}
                                        description={t(item.descriptionKey)}
                                        pdfUrl={item.pdfUrl}
                                        icon={ICON_MAP[item.iconName]}
                                        ctaLabel={t("card.cta")}
                                    />
                                ))}
                            </div>
                        </section>
                    ))}

                    <div role="note" className={styles.infoBanner}>
                        <i aria-hidden="true" className="ti ti-info-circle" />

                        <p>
                            <strong>{t("infoBanner.title")}</strong>{" "}
                            {t("infoBanner.body")}
                        </p>
                    </div>
                </main>
            </div>
        </div>
    );
}
