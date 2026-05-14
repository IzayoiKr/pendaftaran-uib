'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from './Footer.module.scss';
import { footerNavLinks, contactInfo, externalLinks } from "./data";
import scrollToId from "@/utils/ScrollToId";
import { socialIconMap } from "@/components/Icons/Icons";

function FooterMenu() {
    const pathname = usePathname();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
        const hashMatch = to.match(/^\/#(.+)/);
        if (hashMatch && pathname === '/') {
            e.preventDefault();
            scrollToId(hashMatch[1]);
        }
    }

    return (
        <div className={styles.widget}>
            <h2>Menu</h2>
            <ul className={styles.widgetList}>
                {footerNavLinks.map(link => {
                    const isExternal = link.to.startsWith('http');
                    return (
                        <li key={link.to}>
                            {isExternal ? (
                                <a href={link.to} target="_blank" rel="noopener noreferrer">{link.label}</a>
                            ) : (
                                <Link href={link.to} onClick={(e) => handleClick(e, link.to)}>{link.label}</Link>
                            )}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

function FooterContact() {
    return (
        <div className={styles.widget} id="kontak">
            <h2>Kontak</h2>
            <address>
                <strong>{contactInfo.university}</strong><br />
                {contactInfo.address}<br />
                Phone: {contactInfo.phone} / Fax: {contactInfo.fax}<br />
                Email: <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a><br />
                Line Official: <a href={contactInfo.line} target="_blank" rel="noopener noreferrer">Pusat Informasi UIB</a>
            </address>
        </div>
    )
}

function FooterMap() {
    return (
        <div className={styles.widget}>
            <h2>Lokasi Kampus</h2>
            <iframe
                src={externalLinks.mapEmbedUrl}
                width="100%"
                height="200"
                allowFullScreen
                loading="lazy"
                title="Lokasi Universitas Internasional Batam"
            ></iframe>
        </div>
    )
}

function FooterSocial() {
    return (
        <div className={styles.footerSocial}>
            {externalLinks.socials.map(social => {
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
                )
            })}
        </div>
    )
}

function FooterTop() {
    return (
        <div className={styles.footerTop}>
            <FooterMenu />
            <FooterContact />
            <FooterMap />
        </div>
    )
}

function FooterBottom() {
    return (
        <div className={styles.footerBottom}>
            <p>Copyright &copy; {new Date().getFullYear()} | Universitas Internasional Batam</p>
            <FooterSocial />
        </div>
    )
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
