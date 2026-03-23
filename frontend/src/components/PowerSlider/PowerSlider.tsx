import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { programs } from '../../constants/data';
import ProgramCard from '../../pages/Home/ProgramStudi/ProgramCard';

import styles from './PowerSlider.module.scss';

export default function ProgramSlider() {
  return (
    <div className={styles.wrapper}>
      <Swiper
        modules={[Navigation, Autoplay, Pagination]}

        onBeforeInit={(swiper) => {
          (swiper.params.navigation as any).prevEl = `.${styles.prev}`;
          (swiper.params.navigation as any).nextEl = `.${styles.next}`;
        }}

        navigation={{
          prevEl: '.custom-prev',
          nextEl: '.custom-next',
        }}

        loop={true}
        speed={800}

        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}

        pagination={{
          clickable: true,
        }}

        spaceBetween={30}

        breakpoints={{
          576: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 },
        }}
      >
        {programs.map((item) => (
          <SwiperSlide key={item.id}>
            <ProgramCard program={item} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* tombol custom (di luar swiper) */}
      <div className={styles.prev}></div>
      <div className={styles.next}></div>
    </div>
  );
}