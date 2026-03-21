import { Link } from "react-router-dom";
import styles from './Footer.module.scss';
import { footerNavLinks } from "../../constants/navigation";
import { contactInfo, externalLinks } from "../../constants/contact";
import scrollToId from "../ScrollToId";
import { socialIconMap } from "../Icons";

function FooterMenu() {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, to: string) => {
        const hashMatch = to.match(/^\/#(.+)/);
        if (hashMatch && window.location.pathname === '/') {
            e.preventDefault();
            scrollToId(hashMatch[1]);
        }
    }

    return (
        <div className={styles.widget}>
            <h4>Menu</h4>
            <ul className={styles.widgetList}>
                {footerNavLinks.map(link => {
                    const isExternal = link.to.startsWith('http');
                    return (
                        <li key={link.to}>
                            {isExternal ? (
                                <a href={link.to} target="_blank" rel="noopener noreferrer">{link.label}</a>
                            ) : (
                                <Link to={link.to} onClick={(e) => handleClick(e, link.to)}>{link.label}</Link>
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
        <div className={styles.widget}>
            <h4>Kontak</h4>
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
            <h4>Lokasi Kampus</h4>
            <iframe
                src={externalLinks.mapEmbedUrl}
                width="100%"
                height="200"
                style={{ border: 0 }}
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
        <footer id="kontak">
            <div className={styles.container}>
                <FooterTop />
                <FooterBottom />
            </div>
        </footer>
    );
}

