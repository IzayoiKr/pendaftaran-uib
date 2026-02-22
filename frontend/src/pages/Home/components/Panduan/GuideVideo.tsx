import type { FC } from 'react';
import styles from './GuideVideo.module.scss';

interface Props {
    title: string;
    videoId: string;
}

const GuideVideo: FC<Props> = ({ title, videoId }) => {
    return (
        <div className={styles.video}>
            <h3>{title}</h3>
            <p>Silahkan ikuti video dibawah ini</p>
            <iframe
                width="100%"
                height="315"
                src={`https://www.youtube.com/embed/${videoId}`}
                title={title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>
        </div>
    );
};

export default GuideVideo;

