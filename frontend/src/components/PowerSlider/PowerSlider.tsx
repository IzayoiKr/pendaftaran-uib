import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';

import { programs } from '../../constants/data';
import ProgramCard from '../../pages/Home/ProgramStudi/ProgramCard';

export default function ProgramSlider() {
  return (
    <Swiper
      modules={[Navigation]}
      navigation
      spaceBetween={20}
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
  );
}