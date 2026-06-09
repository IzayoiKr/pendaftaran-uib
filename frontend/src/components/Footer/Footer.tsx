"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { socialIconMap } from "@/components/Icons/Icons";
import { contactInfo, socialLinks } from "./data";
import styles from "./Footer.module.scss";

function FooterLogo() {
    return (
        <div className={styles.logoBlock}>
            <div className={styles.logoMark}>
                <Image
                    src="/favicon/uib-76.svg"
                    alt="UIB Logo"
                    width={40}
                    height={40}
                    priority
                />
            </div>
            <div className={styles.logoText}>
                <p className={styles.logoName}>
                    Universitas Internasional Batam
                </p>
                <p className={styles.logoSub}>
                    Batam, Kepulauan Riau, Indonesia
                </p>
            </div>
        </div>
    );
}

function FooterContacts() {
    return (
        <div className={styles.contacts}>
            <div className={styles.contactItem}>
                <i
                    className={`ti ti-map-pin ${styles.contactIcon}`}
                    aria-hidden="true"
                />
                <p className={styles.contactText}>{contactInfo.address}</p>
            </div>

            <div className={styles.contactItem}>
                <i
                    className={`ti ti-phone ${styles.contactIcon}`}
                    aria-hidden="true"
                />
                <p className={styles.contactText}>
                    {contactInfo.phone} · Fax {contactInfo.fax}
                </p>
            </div>

            <div className={styles.contactItem}>
                <i
                    className={`ti ti-mail ${styles.contactIcon}`}
                    aria-hidden="true"
                />
                <p className={styles.contactText}>
                    <a href={`mailto:${contactInfo.email}`}>
                        {contactInfo.email}
                    </a>
                </p>
            </div>

            <div className={styles.contactItem}>
                <i
                    className={`ti ti-brand-line ${styles.contactIcon}`}
                    aria-hidden="true"
                />
                <p className={styles.contactText}>
                    <a
                        href={contactInfo.line}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        LINE Official UIB
                    </a>
                </p>
            </div>
        </div>
    );
}

function FooterSocials() {
    return (
        <div className={styles.right}>
            {socialLinks.map((social) => (
                <a
                    key={social.name}
                    href={social.url}
                    className={styles.socialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                >
                    {socialIconMap[social.name]}
                </a>
            ))}
        </div>
    );
}

export default function Footer() {
    const t = useTranslations("footer");

    return (
        <footer className={styles.footer}>
            <div id="contact" className={styles.stripe} />

            <div className={styles.inner}>
                <div className={styles.main}>
                    <div className={styles.left}>
                        <FooterLogo />
                        <div className={styles.divider} aria-hidden="true" />
                        <FooterContacts />
                    </div>

                    <FooterSocials />
                </div>

                <div className={styles.bottom}>
                    <p className={styles.copyright}>
                        {t("copyright", {
                            year: new Date().getFullYear(),
                        })}
                    </p>

                    <div className={styles.legalLinks}>
                        <Link href="/kebijakan-privasi">{t("privacy")}</Link>
                        <Link href="/syarat-ketentuan">{t("terms")}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
