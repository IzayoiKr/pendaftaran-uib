import { guides } from '../../../constants/data';
import styles from './Guides.module.scss'

interface GuideVideoProps {
    title: string;
    description: string;
    embedUrl: string;
}

function GuideVideo({ title, description, embedUrl }: GuideVideoProps) {
    return (
        <div className={styles.card}>
            <div className={styles.cardBody}>
                <h3>{title}</h3>
                <p>{description}</p>
                <div className={styles.videoWrapper}>
                    <iframe
                        src={embedUrl}
                        title={title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                        loading='lazy'
                    />
                </div>
            </div>
        </div>
    );
};

export default function Guides() {
    return (
        <section className={styles.guide}>
            <div className={styles.container}>
                <h2>Guides</h2>
                <div className={styles.stack}>
                    {guides.map(guide => (
                        <GuideVideo
                            key={guide.id}
                            title={guide.title}
                            description={guide.description}
                            embedUrl={guide.embedUrl}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
