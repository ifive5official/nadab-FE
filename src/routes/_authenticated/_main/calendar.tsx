import SearchBar from "@/components/SearchBar";
import { createFileRoute, Link } from "@tanstack/react-router";
import emotions from "@/constants/emotions";
import { EmotionBadge } from "@/components/Badges";
import { useState, useMemo, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  NoResultIcon,
} from "@/components/Icons";
import clsx from "clsx";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import type { ApiResponse } from "@/generated/api";
import { Swiper, SwiperSlide } from "swiper/react";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";
// @ts-ignore
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { recentOptions } from "@/features/calendar/queries";
import BlockButton from "@/components/BlockButton";
import { answerOptions } from "@/features/report/quries";
import Container from "@/components/Container";
import Loading from "@/components/Loading";

export const Route = createFileRoute("/_authenticated/_main/calendar")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(recentOptions),
  pendingComponent: () => <Loading />,
  pendingMs: 200, // 0.2초 이상 걸릴 때만 로딩 컴포넌트 표시
  pendingMinMs: 200,
});

type CalendarReq = components["schemas"]["GetMonthlyCalendarRequest"];
type CalendarRes = components["schemas"]["MonthlyCalendarResponse"];

function RouteComponent() {
  // 현재 캘린더에서 보고있는 날짜
  const [currentDate, setCurrentDate] = useState(new Date());
  // 특정 답변만 미리보기 할 때 선택하는 날짜
  const [selectedDate, setSelectedDate] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // 캘린더 데이터 가져오기
  // Todo: 에러 처리
  const { data: calendarData } = useQuery({
    queryKey: ["currentUser", "calendar", year, month],
    queryFn: async () => {
      const req: CalendarReq = {
        year,
        month: month + 1,
      };
      const res = await api.get<ApiResponse<CalendarRes>>(
        "/api/v1/answers/calendar",
        {
          params: req,
        },
      );
      return res.data.data!;
    },
  });

  // 최근 기록 미리보기 데이터
  const { data: recentData } = useSuspenseQuery(recentOptions);

  // 특정 날짜 답변 미리보기 데이터
  // Todo: 에러 처리
  const { data: answer } = useQuery(answerOptions.detail(selectedDate));

  // 날짜로 찾기 쉽게 받아온 캘린더 데이터 레코드화
  const entryMap = useMemo(() => {
    const map: Record<string, (typeof emotions)[number]["code"]> = {};
    calendarData?.calendarEntries?.forEach((entry) => {
      map[entry.date!] = entry.emotionCode as (typeof emotions)[number]["code"];
    });
    return map;
  }, [calendarData]);

  // 이하 날짜 채우기
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 이번달 시작 요일
  const daysInMonth = new Date(year, month + 1, 0).getDate(); // 이번달 마지막 날짜
  const lastDateOfPrevMonth = new Date(year, month, 0).getDate(); // 저번달 마지막 날짜

  const calendarDays = [];

  function createDateObj(d: number, type: "prev" | "next" | "current") {
    const offset = type === "prev" ? -1 : type === "next" ? 1 : 0;
    const date = new Date(year, month + offset, d);
    return {
      day: d,
      monthType: type,
      dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        "0",
      )}-${String(date.getDate()).padStart(2, "0")}`,
    };
  }

  // 이전 달 날짜
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    calendarDays.push(createDateObj(lastDateOfPrevMonth - i, "prev"));
  }
  // 이번 달 날짜
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(createDateObj(i, "current"));
  }
  // 다음 달 날짜
  const remainingCells = 42 - calendarDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push(createDateObj(i, "next"));
  }

  function goPrevMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function goNextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  const paginationRef = useRef(null);

  return (
    <Container isMain={true}>
      <Link to="/search">
        <div className="pointer-events-none mt-margin-y-m mb-margin-y-s">
          {/* @ts-ignore */}
          <SearchBar
            className="h-11"
            placeholder="검색을 통해 기록을 되돌아보세요."
          />
        </div>
      </Link>
      <div className="flex-1 flex flex-col justify-around gap-gap-y-l">
        {/* 감정 목록 */}
        <div className="grid grid-cols-4 gap-1.5">
          {emotions.map((emotion) => (
            <EmotionBadge key={emotion.code} emotion={emotion.code} filled />
          ))}
        </div>
        {/* 캘린더 */}
        <section className="border-y border-y-interactive-border-default py-gap-y-s">
          {/* 헤더 */}
          <div className="flex items-center gap-gap-x-s px-padding-x-xs py-padding-y-xxs mb-margin-y-s">
            <span className="text-label-l mr-auto">
              {year}년 {month + 1}월
            </span>
            <button onClick={goPrevMonth}>
              <ChevronLeftIcon />
            </button>
            <button onClick={goNextMonth}>
              <ChevronRightIcon />
            </button>
          </div>
          {/* 요일 */}
          <div className="grid grid-cols-7 mb-margin-y-xs text-caption-m py-padding-y-xs text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>
          {/* 날짜 */}
          <div className="grid grid-cols-7 gap-y-margin-y-xs text-center">
            {calendarDays.map((dateObj, index) => {
              const isCurrentMonth = dateObj.monthType === "current";
              const isToday =
                isCurrentMonth &&
                new Date().getDate() === dateObj.day &&
                new Date().getMonth() === month &&
                new Date().getFullYear() === year;
              const emotionCode = entryMap[dateObj.dateString];
              // Todo: 감정 code를 키로 갖게 바꾸자....
              const emotionColor = emotions.find(
                (emotion) => emotion.code === emotionCode,
              )?.color;
              return (
                <div
                  key={index}
                  className="cursor-pointer py-padding-y-xs relative flex items-center justify-center"
                  onClick={() => {
                    if (emotionCode) {
                      setSelectedDate(dateObj.dateString);
                    } else {
                      setSelectedDate("");
                    }
                    setCurrentDate(new Date(dateObj.dateString));
                  }}
                >
                  {emotionCode && (
                    <div
                      style={{
                        backgroundColor: emotionColor,
                      }}
                      className="absolute left-1/2 -translate-x-1/2 inset-y-0 rounded-full aspect-square opacity-40"
                    />
                  )}
                  {isToday && (
                    <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[5px] aspect-square bg-brand-primary rounded-full" />
                  )}
                  <span
                    className={clsx(
                      "relative text-caption-m",
                      isCurrentMonth
                        ? "text-text-primary"
                        : "text-text-disabled",
                      emotionCode && "font-bold!",
                    )}
                  >
                    {dateObj.day}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
        <div className="grid grid-cols-1 items-start">
          {/* // 해당 날짜에 답변한 내용이 있다면 보여줌 */}
          <section
            className={clsx(
              "col-start-1 row-start-1",
              !selectedDate && "invisible",
            )}
          >
            <div className="flex flex-col gap-gap-y-l">
              {answer ? (
                <div className="px-padding-x-m py-padding-y-m bg-surface-layer-1 rounded-lg border border-border-base">
                  <div className="flex justify-between mb-margin-y-s">
                    <EmotionBadge
                      emotion={
                        answer.emotion as (typeof emotions)[number]["code"]
                      }
                    />
                    <span className="text-caption-s text-text-tertiary">
                      {answer.answerDate}
                    </span>
                  </div>
                  <p className="text-label-l truncate">{answer.questionText}</p>
                  <p className="text-caption-m truncate">{answer.answer}</p>
                </div>
              ) : (
                <div className="px-padding-x-m py-padding-y-m bg-surface-layer-1 rounded-lg border border-border-base">
                  <div className="invisible">
                    <div className="flex justify-between mb-margin-y-s">
                      <EmotionBadge emotion="ACHIEVEMENT" />
                      <span className="text-caption-s text-text-tertiary">
                        test
                      </span>
                    </div>
                    <p className="text-label-l truncate">test</p>
                    <p className="text-caption-m truncate">test</p>
                  </div>
                </div>
              )}
              <div className="flex gap-margin-x-m">
                <BlockButton
                  variant="secondary"
                  onClick={() => setSelectedDate("")}
                >
                  최근 기록 보기
                </BlockButton>
                <Link
                  className="w-full"
                  to="/detail/$date"
                  params={{ date: selectedDate }}
                >
                  <BlockButton>상세보기</BlockButton>
                </Link>
              </div>
            </div>
          </section>

          {/* // 해당 날짜에 답변한 내용이 없다면
            // 최근 기록 / 해당 날짜 기록 */}
          <section
            className={clsx(
              "col-start-1 row-start-1",
              selectedDate && "invisible",
            )}
          >
            <span className="text-label-l py-padding-y-xxs">
              최근 기록 미리보기
            </span>
            {(recentData?.items?.length ?? 0 > 0) ? (
              <>
                <Swiper
                  className="mt-gap-y-m mb-gap-y-l"
                  modules={[Pagination]}
                  pagination={{ enabled: false }}
                  spaceBetween={8}
                  slidesPerView={2} // 한 화면에 보여질 개수
                  slidesPerGroup={2} // 한 번에 넘어가는 개수>
                  onSwiper={(swiper) => {
                    // 순서 이슈로 ref가 주입이 안 되어서 임시 땜빵
                    setTimeout(() => {
                      // @ts-ignore
                      swiper.params.pagination.el = paginationRef.current;

                      swiper.pagination.init();
                      swiper.pagination.render();
                      swiper.pagination.update();
                    });
                  }}
                >
                  {recentData?.items?.map((item) => {
                    return (
                      <SwiperSlide
                        key={item.answerId}
                        style={{
                          WebkitUserSelect: "none",
                          MozUserSelect: "none",
                          msUserSelect: "none",
                          userSelect: "none",
                        }}
                      >
                        <Link
                          to="/detail/$date"
                          params={{ date: item.answerDate! }}
                        >
                          <div className="px-padding-x-m py-padding-y-s bg-surface-layer-1 rounded-lg">
                            <div className="flex justify-between mb-margin-y-m">
                              <EmotionBadge
                                emotion={
                                  item.emotionCode as (typeof emotions)[number]["code"]
                                }
                              />
                              <span className="text-caption-s text-text-tertiary">
                                {item.answerDate}
                              </span>
                            </div>
                            <p className="text-label-s h-10 line-clamp-2">
                              {item.questionText}
                            </p>
                            <p className="text-caption-s h-8 line-clamp-2">
                              {item.matchedSnippet}
                            </p>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
                <div ref={paginationRef} />
              </>
            ) : (
              <>
                <div className="flex flex-col text-center items-center pt-padding-y-m">
                  <NoResultIcon className="p-3" size={48} />
                  <p className="text-button-1 mt-margin-y-m mb-gap-y-xs">
                    아직 남긴 기록이 없어요.
                  </p>
                  <p className="text-caption-s">
                    오늘의 질문에 답하고 기록을 되돌아보세요.
                  </p>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </Container>
  );
}
