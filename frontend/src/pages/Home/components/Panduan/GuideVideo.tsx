import type { FC } from 'react';
import styles from './GuideVideo.module.scss';

interface Props {
    title: string;
    videoId: string;
}

const GuideVideo: FC<Props> = ({ title, videoId }) => {
    return (
        <div className={styles.card}>
            <div className={styles.desc}>
                <h4>{title}</h4>
                <p>Silahkan ikuti video dibawah ini</p>
                <iframe
                    width="560"
                    height="315"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                ></iframe>
            </div>
        </div>
    );
};

export default GuideVideo;
