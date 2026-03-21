import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

// import 'swiper/css';
// import 'swiper/css/navigation';

import { programs } from '../../constants/data';

export default function ProgramSlider() {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={20}
      breakpoints={{
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      }}
    >
      {programs.map((item) => (
        <SwiperSlide key={item.id}>
          <div className="card">
            <img src={item.image} alt={item.title} />
            <h3>{item.title}</h3>
            <p>{item.degree}</p>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}