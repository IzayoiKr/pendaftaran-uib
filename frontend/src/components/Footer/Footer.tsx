import type { FC } from "react";
import { Link } from "react-router-dom";
import styles from './Footer.module.scss';

const Footer: FC = () => {
    return (
        <footer className={styles.footer} id="kontak">
            <div className="container">
                <div className={styles.row}>
                    <div className={styles.col}>
                        <h4>Menu</h4>
                        <ul>
                            <li><Link to="/">Beranda</Link></li>
                            <li><Link to="/#gelombang">Gelombang</Link></li>
                            <li><Link to="/info-umum">Info Umum</Link></li>
                            <li><a href="https://www.uib.ac.id/category/pengumuman/" target="_blank" rel="noopener noreferrer">Pengumuman</a></li>
                            <li><Link to="/login">Daftar/Login</Link></li>
                        </ul>
                    </div>
                    <div className={styles.col}>
                        <h4>Kontak</h4>
                        <address>
                            <strong>Universitas Internasional Batam</strong><br />
                            Jl. Gajah Mada, Baloi - Sei Ladi, Batam 29442<br />
                            Phone: (0778) 743 7111<br />
                            Fax: (0778) 743 7112<br />
                            Email: <a href="mailto:humas@uib.ac.id">humas@uib.ac.id</a><br />
                            Line Official: <a href="https://lin.ee/2Ep0bNN" target="_blank" rel="noopener noreferrer">Pusat Informasi UIB</a>
                        </address>
                    </div>
                    <div className={styles.col}>
                        <h4>Lokasi Kampus</h4>
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.0568544597563!2d104.00080231431652!3d1.1194203625853616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31d98be09646b351%3A0x36a826082690c786!2sUniversitas+Internasional+Batam!5e0!3m2!1sen!2sid!4v1453347461824"
                            width="100%"
                            height="200"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            title="UIB Map"
                        ></iframe>
                    </div>
                </div>
                <div className={styles.bottom}>
                    <p>Copyright &copy; {new Date().getFullYear()} | Universitas Internasional Batam</p>
                    <div className={styles.social}>
                        <a href="https://www.instagram.com/humasuib/" target="_blank" rel="noopener noreferrer"><i className="ti-instagram"></i> Instagram</a>
                        <a href="https://www.youtube.com/channel/UCEvBaqNRmjsIAxb53bpElYQ" target="_blank" rel="noopener noreferrer"><i className="ti-youtube"></i> YouTube</a>
                        <a href="http://eservice.uib.ac.id/kbtopic/humas/" target="_blank" rel="noopener noreferrer"><i className="ti-announcement"></i> Pengumuman</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;

