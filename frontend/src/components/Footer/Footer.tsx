"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname } from "next/navigation";
import scrollToId from "@/utils/ScrollToId";
import useAuthStore from "@/store/useAuthStore";
import { socialIconMap } from "@/components/Icons/Icons";
import { contactInfo, externalLinks, footerNavLinks } from "./data";
import styles from "./Footer.module.scss";

function FooterMenu() {
    const pathname = usePathname();
    const t = useTranslations("footer");
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    const handleClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        to: string,
    ) => {
        const hashMatch = to.match(/^\/#(.+)/);
        if (hashMatch && pathname === "/") {
            e.preventDefault();
            scrollToId(hashMatch[1]);
        }
    };

    return (
        <div className={styles.widget}>
            <h2>{t("menuTitle")}</h2>
            <ul className={styles.widgetList}>
                {footerNavLinks.map((link) => {
                    const isLoginLink = link.labelKey === "login";
                    const displayTo =
                        isLoginLink && isAuthenticated ? "/account" : link.to;
                    const labelKey =
                        isLoginLink && isAuthenticated
                            ? "myAccount"
                            : `nav.${link.labelKey}`;
                    const isExternal = link.to.startsWith("http");

                    return (
                        <li key={link.to}>
                            {isExternal ? (
                                <a
                                    href={link.to}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {t(labelKey)}
                                </a>
                            ) : (
                                <Link
                                    href={displayTo}
                                    onClick={(e) => handleClick(e, displayTo)}
                                >
                                    {t(labelKey)}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function FooterContact() {
    const t = useTranslations("footer");

    return (
        <div className={styles.widget} id="kontak">
            <h2>{t("contactTitle")}</h2>
            <address>
                <strong>{contactInfo.university}</strong>
                <br />
                {contactInfo.address}
                <br />
                {t("phone")}: {contactInfo.phone} / {t("fax")}:{" "}
                {contactInfo.fax}
                <br />
                {t("email")}:{" "}
                <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
                <br />
                {t("lineOfficial")}:{" "}
                <a
                    href={contactInfo.line}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {t("infoLine")}
                </a>
            </address>
        </div>
    );
}

function FooterMap() {
    const t = useTranslations("footer");

    return (
        <div className={styles.widget}>
            <h2>{t("locationTitle")}</h2>
            <iframe
                src={externalLinks.mapEmbedUrl}
                width="100%"
                height="200"
                allowFullScreen
                loading="lazy"
                title={t("mapTitle")}
            ></iframe>
        </div>
    );
}

function FooterSocial() {
    return (
        <div className={styles.footerSocial}>
            {externalLinks.socials.map((social) => {
                return (
                    <a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={styles.socialIcon}
                    >
                        {socialIconMap[social.name] ?? social.name}
                    </a>
                );
            })}
        </div>
    );
}

function FooterTop() {
    return (
        <div className={styles.footerTop}>
            <FooterMenu />
            <FooterContact />
            <FooterMap />
        </div>
    );
}

function FooterBottom() {
    const t = useTranslations("footer");

    return (
        <div className={styles.footerBottom}>
            <p>{t("copyright", { year: new Date().getFullYear() })}</p>
            <FooterSocial />
        </div>
    );
}

export default function Footer() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <FooterTop />
                <FooterBottom />
            </div>
        </footer>
    );
}
