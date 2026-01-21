import SegmentedControls from "@/components/SegmentedControls";
import FriendsTab from "@/features/social/FriendsTab";
import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper/types";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import FeedTab from "@/features/social/FeedTab";
import GroupTab from "@/features/social/GroupTab";

export const Route = createFileRoute("/_authenticated/_main/social")({
  component: RouteComponent,
});

function RouteComponent() {
  const [selected, setSelected] = useState("feed");
  const swiperRef = useRef<SwiperType>(null);

  const tabs = [
    { label: "피드", value: "feed" },
    { label: "그룹", value: "group" },
    { label: "친구", value: "friend" },
  ];

  function handleTabChange(value: string) {
    setSelected(value);
    const index = tabs.findIndex((tab) => tab.value === value);
    if (swiperRef.current) {
      swiperRef.current.slideTo(index);
    }
  }

  function handleSlideChange(swiper: SwiperType) {
    const currentIndex = swiper.activeIndex;
    setSelected(tabs[currentIndex].value);
  }

  return (
    <>
      <SegmentedControls
        options={tabs}
        selected={selected}
        onChange={handleTabChange}
        className="my-padding-y-m mx-padding-x-m"
      />
      <Swiper
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        initialSlide={0}
        autoHeight={true}
        className="w-full flex-1"
      >
        <SwiperSlide>
          <FeedTab />
        </SwiperSlide>
        <SwiperSlide>
          <GroupTab />
        </SwiperSlide>
        <SwiperSlide>
          <FriendsTab />
        </SwiperSlide>
      </Swiper>
    </>
  );
}
