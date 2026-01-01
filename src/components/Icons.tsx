// 네이밍 규칙: 아이콘 이름(카멜케이스) + Icon

// 랜딩페이지===================================
export function NaverIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.2012 5V12.5684L8.81997 5H3V20H8.79878V12.4316L14.1821 20H20V5H14.2012Z"
        fill="#00D03F"
      />
    </svg>
  );
}

export function GoogleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <rect width="24" height="24" fill="url(#pattern0_15469_10679)" />
      <defs>
        <pattern
          id="pattern0_15469_10679"
          patternContentUnits="objectBoundingBox"
          width="1"
          height="1"
        >
          <use xlinkHref="#image0_15469_10679" transform="scale(0.003125)" />
        </pattern>
        <image
          id="image0_15469_10679"
          width="320"
          height="320"
          preserveAspectRatio="none"
          xlinkHref="data:image/png;base64,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"
        />
      </defs>
    </svg>
  );
}

export function RoundEmailIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM19.6 8.25L12.53 12.67C12.21 12.87 11.79 12.87 11.47 12.67L4.4 8.25C4.29973 8.19371 4.21192 8.11766 4.14189 8.02645C4.07186 7.93525 4.02106 7.83078 3.99258 7.71937C3.96409 7.60796 3.9585 7.49194 3.97616 7.37831C3.99381 7.26468 4.03434 7.15581 4.09528 7.0583C4.15623 6.96079 4.23632 6.87666 4.33073 6.811C4.42513 6.74533 4.53187 6.69951 4.6445 6.6763C4.75712 6.65309 4.87328 6.65297 4.98595 6.67595C5.09863 6.69893 5.20546 6.74453 5.3 6.81L12 11L18.7 6.81C18.7945 6.74453 18.9014 6.69893 19.014 6.67595C19.1267 6.65297 19.2429 6.65309 19.3555 6.6763C19.4681 6.69951 19.5749 6.74533 19.6693 6.811C19.7637 6.87666 19.8438 6.96079 19.9047 7.0583C19.9657 7.15581 20.0062 7.26468 20.0238 7.37831C20.0415 7.49194 20.0359 7.60796 20.0074 7.71937C19.9789 7.83078 19.9281 7.93525 19.8581 8.02645C19.7881 8.11766 19.7003 8.19371 19.6 8.25Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

//==============================================
export function SelectAllCheckboxIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g opacity="0.6">
        <path
          d="M9.99967 0.833252C4.94551 0.833252 0.833008 4.94575 0.833008 9.99992C0.833008 15.0541 4.94551 19.1666 9.99967 19.1666C15.0538 19.1666 19.1663 15.0541 19.1663 9.99992C19.1663 4.94575 15.0538 0.833252 9.99967 0.833252ZM8.59051 13.9591L5.23967 10.5616L6.42634 9.39158L8.59967 11.5958L13.578 6.63159L14.7547 7.81158L8.59051 13.9591Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}
export function AgreementCheckboxIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.92508 12.8895L15.8367 5L16.7194 5.88512L7.91764 14.6622L3.33301 10.0131L4.22305 9.13538L7.92508 12.8895Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AgreementChevronIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.5499 4.16675L12.9918 9.60869L7.5499 15.0506L6.66602 14.1667L11.2241 9.60869L6.66602 5.05063L7.5499 4.16675Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1213 11.5303L15.591 6.06066L14.5303 5L8 11.5303L14.5303 18.0607L15.591 17L10.1213 11.5303Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChevronRightIcon({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.0607 5L16.591 11.5303L10.0607 18.0607L9 17L14.4697 11.5303L9 6.06066L10.0607 5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={"box-content " + className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.625 10.0625H8.53125V8.75H10.9375V13.125H12.0312V14.4375H9.625V10.0625Z"
        fill="var(--color-icon-info)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.625 7.65625V5.90625H10.9375V7.65625H9.625Z"
        fill="var(--color-icon-info)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.2812 3.0625C6.29444 3.0625 3.0625 6.29444 3.0625 10.2812C3.0625 14.2681 6.29444 17.5 10.2812 17.5C14.2681 17.5 17.5 14.2681 17.5 10.2812C17.5 6.29444 14.2681 3.0625 10.2812 3.0625ZM1.75 10.2812C1.75 5.56957 5.56957 1.75 10.2812 1.75C14.9929 1.75 18.8125 5.56957 18.8125 10.2812C18.8125 14.9929 14.9929 18.8125 10.2812 18.8125C5.56957 18.8125 1.75 14.9929 1.75 10.2812Z"
        fill="var(--color-icon-info)"
      />
    </svg>
  );
}

// 카테고리==================================
export function Deco4FilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.7181 8.30328C12.5341 8.19261 12.3347 8.09194 12.1207 7.99994C12.3347 7.90794 12.5341 7.80728 12.7181 7.69661C13.7167 7.09728 14.2667 6.21061 14.2667 5.19994C14.2667 3.41794 12.5821 1.73328 10.8001 1.73328C9.78873 1.73328 8.90206 2.28328 8.3034 3.28194C8.19273 3.46594 8.09206 3.66528 8.00006 3.87928C7.90806 3.66528 7.8074 3.46594 7.69673 3.28194C7.0974 2.28328 6.21073 1.73328 5.20007 1.73328C3.41807 1.73328 1.7334 3.41794 1.7334 5.19994C1.7334 5.89594 2.0054 7.20861 3.8714 8.00394C3.66073 8.09461 3.46407 8.19461 3.28207 8.30394C2.2834 8.90261 1.7334 9.78994 1.7334 10.8006C1.7334 12.5826 3.41807 14.2673 5.20007 14.2673C6.2114 14.2673 7.0974 13.7173 7.69673 12.7186C7.80607 12.5373 7.9054 12.3406 7.99673 12.1293C8.79207 13.9953 10.1047 14.2673 10.8007 14.2673C12.5827 14.2673 14.2674 12.5826 14.2674 10.8006C14.2674 9.78928 13.7174 8.90261 12.7187 8.30394L12.7181 8.30328Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

export function HappyFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.33301 1.18518C4.46634 1.18518 1.33301 4.31851 1.33301 8.18518C1.33301 12.0518 4.46634 15.1852 8.33301 15.1852C12.1997 15.1852 15.333 12.0518 15.333 8.18518C15.333 4.31851 12.1997 1.18518 8.33301 1.18518ZM5.99967 5.51851C6.53301 5.51851 6.99967 5.98518 6.99967 6.51851C6.99967 7.05185 6.53301 7.51851 5.99967 7.51851C5.46634 7.51851 4.99967 7.05185 4.99967 6.51851C4.99967 5.98518 5.46634 5.51851 5.99967 5.51851ZM8.33301 11.7852C7.19967 11.7852 6.06634 11.3852 5.19967 10.5185L6.13301 9.58518C7.33301 10.7852 9.33301 10.7852 10.533 9.58518L11.4663 10.5185C10.5997 11.3852 9.46634 11.7852 8.33301 11.7852ZM10.6663 7.51851C10.133 7.51851 9.66634 7.05185 9.66634 6.51851C9.66634 5.98518 10.133 5.51851 10.6663 5.51851C11.1997 5.51851 11.6663 5.98518 11.6663 6.51851C11.6663 7.05185 11.1997 7.51851 10.6663 7.51851Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

export function CoffeeFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_16360_11924)">
        <path
          d="M5 3.18525C5 3.23525 4.96733 3.28925 4.90867 3.33792C4.62467 3.57259 4.58533 3.99259 4.82 4.27659C4.952 4.43592 5.142 4.51859 5.334 4.51859C5.484 4.51859 5.634 4.46859 5.75867 4.36592C6.124 4.06325 6.334 3.63325 6.334 3.18525C6.334 2.73725 6.12467 2.30725 5.75867 2.00459C5.7 1.95592 5.66733 1.90125 5.66733 1.85192C5.66733 1.80259 5.7 1.74792 5.75867 1.69925C6.04267 1.46459 6.082 1.04459 5.84733 0.760587C5.612 0.476587 5.192 0.437253 4.90867 0.67192C4.54333 0.974587 4.33333 1.40459 4.33333 1.85259C4.33333 2.30059 4.54267 2.73059 4.90867 3.03325C4.96733 3.08192 5 3.13592 5 3.18525Z"
          fill={fill ?? "var(--color-icon-primary)"}
        />
        <path
          d="M7.66667 3.18525C7.66667 3.23525 7.634 3.28925 7.57533 3.33792C7.29133 3.57259 7.252 3.99259 7.48667 4.27659C7.61867 4.43592 7.80867 4.51859 8.00067 4.51859C8.15067 4.51859 8.30067 4.46859 8.42533 4.36592C8.79067 4.06325 9.00067 3.63325 9.00067 3.18525C9.00067 2.73725 8.79133 2.30725 8.42533 2.00459C8.36667 1.95592 8.334 1.90125 8.334 1.85192C8.334 1.80259 8.36667 1.74792 8.42533 1.69925C8.70867 1.46459 8.74933 1.04459 8.514 0.760587C8.27933 0.476587 7.85933 0.437253 7.57533 0.67192C7.21 0.974587 7 1.40459 7 1.85259C7 2.30059 7.20933 2.73059 7.57533 3.03325C7.634 3.08192 7.66667 3.13592 7.66667 3.18525Z"
          fill={fill ?? "var(--color-icon-primary)"}
        />
        <path
          d="M12.3333 5.85181H12C12 5.48381 11.702 5.18514 11.3333 5.18514H2.66667C2.29867 5.18514 2 5.48381 2 5.85181V11.8518C2 13.6898 3.49533 15.1851 5.33333 15.1851H8.66667C10.5047 15.1851 12 13.6898 12 11.8518H12.3333C13.9873 11.8518 15.3333 10.5058 15.3333 8.85181C15.3333 7.19781 13.9873 5.85181 12.3333 5.85181ZM12.3333 10.5185H12V7.18514H12.3333C13.2527 7.18514 14 7.93314 14 8.85181C14 9.77047 13.2527 10.5185 12.3333 10.5185Z"
          fill={fill ?? "var(--color-icon-primary)"}
        />
      </g>
      <defs>
        <clipPath id="clip0_16360_11924">
          <rect
            width="16"
            height="16"
            fill="white"
            transform="translate(0 -0.148193)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function UsersFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.05 8C6.96 8 7.805 7.61 8.325 7.025C8.975 6.375 9.3 5.595 9.3 4.75C9.3 3.905 8.91 2.995 8.325 2.475C7.675 1.825 6.895 1.5 6.05 1.5C5.205 1.5 4.295 1.89 3.775 2.475C3.125 3.125 2.8 3.905 2.8 4.75C2.8 5.595 3.125 6.505 3.775 7.025C4.425 7.675 5.205 8 6.05 8Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
      <path
        d="M9.69001 10.275C9.105 9.625 8.325 9.3 7.35 9.3H4.75C3.905 9.3 3.125 9.625 2.475 10.21C1.825 10.795 1.5 11.575 1.5 12.55V14.5H10.6V12.55C10.6 11.705 10.275 10.925 9.69001 10.275Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
      <path
        d="M13.59 10.275C13.005 9.625 12.225 9.3 11.25 9.3H10.47C10.47 9.3 10.535 9.365 10.6 9.43C11.445 10.275 11.9 11.38 11.9 12.55V14.5H14.5V12.55C14.5 11.705 14.175 10.925 13.59 10.275Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
      <path
        d="M12.225 2.475C11.575 1.825 10.795 1.5 9.95001 1.5C9.105 1.5 9.495 1.5 9.3 1.565C10.145 2.345 10.6 3.515 10.6 4.75C10.6 5.985 10.145 7.025 9.3 7.935C9.495 7.935 9.755 8 9.95001 8C10.86 8 11.705 7.61 12.225 7.025C12.875 6.375 13.2 5.595 13.2 4.75C13.2 3.905 12.81 2.995 12.225 2.475Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

export function HeartFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M11.0737 1.33337C9.91233 1.33337 8.79766 1.78271 8.00033 2.54204C7.20299 1.78271 6.08766 1.33337 4.92633 1.33337C2.57766 1.33337 0.666992 3.14671 0.666992 5.37471C0.666992 8.46937 2.95966 10.56 7.12233 14.356L7.27166 14.4927C7.39899 14.6087 7.55966 14.6667 7.72099 14.6667C7.88233 14.6667 8.04299 14.6087 8.17033 14.4927C8.77166 13.944 9.34566 13.432 9.88766 12.9494C13.1677 10.0247 15.3343 8.09271 15.3343 5.37537C15.3343 3.14671 13.4237 1.33404 11.0743 1.33404L11.0737 1.33337Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

export function BookOpenedFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.9803 3.54663C13.887 2.96663 12.6603 2.66663 11.3337 2.66663C10.387 2.66663 9.50033 2.81996 8.66699 3.11996V11.3333C8.66699 11.7 8.36699 12 8.00033 12C7.63366 12 7.33366 11.7 7.33366 11.3333V3.11996C6.50033 2.82663 5.61366 2.66663 4.66699 2.66663C3.34033 2.66663 2.11366 2.95996 1.02033 3.54663C0.800325 3.65996 0.666992 3.88663 0.666992 4.13329V12.6666C0.666992 12.9 0.786992 13.12 0.993659 13.24C1.19366 13.36 1.44699 13.3666 1.65366 13.26C2.55366 12.78 3.56699 12.54 4.67366 12.54C5.78033 12.54 6.79366 12.78 7.69366 13.26C7.88699 13.3666 8.12699 13.3666 8.32033 13.26C9.22033 12.78 10.2337 12.54 11.3403 12.54C12.447 12.54 13.4603 12.78 14.3603 13.26C14.4603 13.3133 14.567 13.34 14.6737 13.34C14.7937 13.34 14.9137 13.3066 15.0137 13.2466C15.2137 13.1266 15.3403 12.9066 15.3403 12.6733V4.13329C15.3403 3.88663 15.207 3.65996 14.987 3.54663H14.9803Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

export function MoonFilledIcon({ fill }: { fill?: string }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 21 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M18.6375 10.5874C18.2875 10.4124 17.9375 10.5874 17.675 10.7624C16.7125 11.7249 15.4 12.2499 14 12.2499C11.025 12.2499 8.75 9.9749 8.75 6.9999C8.75 4.0249 10.0625 3.4999 10.2375 3.3249C10.4125 3.1499 10.5875 2.7124 10.4125 2.3624C10.2375 2.0124 9.8875 1.8374 9.5375 1.8374C5.1625 2.1874 1.75 6.0374 1.75 10.4999C1.75 14.9624 5.8625 19.2499 10.5 19.2499C15.1375 19.2499 18.725 16.0124 19.1625 11.4624C19.1625 11.1124 18.9875 10.7624 18.6375 10.5874Z"
        fill={fill ?? "var(--color-icon-primary)"}
      />
    </svg>
  );
}

//===================================

export function LoadingIcon({ height = 24 }: { height?: number }) {
  return (
    <div style={{ height }} className="flex items-center justify-center">
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="animate-spin"
      >
        <g
          clipPath="url(#paint0_angular_15235_14476_clip_path)"
          data-figma-skip-parse="true"
        >
          <g transform="matrix(0 0.01 -0.01 0 10 10)">
            <foreignObject x="-1020" y="-1020" width="2040" height="2040">
              <div
                style={{
                  background:
                    "conic-gradient(from 90deg, rgba(255, 255, 255, 1) 0deg, rgba(255, 255, 255, 1) 63.243deg, rgba(255, 255, 255, 0) 360deg)",
                  height: "100%",
                  width: "100%",
                  opacity: 1,
                }}
              ></div>
            </foreignObject>
          </g>
        </g>
        <path d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM2.99027 10C2.99027 13.8714 6.12863 17.0097 10 17.0097C13.8714 17.0097 17.0097 13.8714 17.0097 10C17.0097 6.12863 13.8714 2.99027 10 2.99027C6.12863 2.99027 2.99027 6.12863 2.99027 10Z" />
        <circle cx="10.1001" cy="18.5" r="1.5" fill="rgb(255, 255, 255)" />
        <defs>
          <clipPath id="paint0_angular_15235_14476_clip_path">
            <path d="M20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10ZM2.99027 10C2.99027 13.8714 6.12863 17.0097 10 17.0097C13.8714 17.0097 17.0097 13.8714 17.0097 10C17.0097 6.12863 13.8714 2.99027 10 2.99027C6.12863 2.99027 2.99027 6.12863 2.99027 10Z" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

export function SuccessIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.51049 15.4674L19.0044 6L20.0636 7.06214L9.50156 17.5947L4 12.0157L5.06805 10.9625L9.51049 15.4674Z"
        fill="var(--color-icon-success)"
      />
    </svg>
  );
}

export function ShowIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.25049 12C8.25049 9.94479 9.94527 8.25 12.0005 8.25C14.0555 8.25 15.7505 9.94362 15.7505 12C15.7505 14.0562 14.0567 15.75 12.0005 15.75C9.94427 15.75 8.25049 14.0562 8.25049 12ZM12.0005 9.75C10.7737 9.75 9.75049 10.7732 9.75049 12C9.75049 13.2278 10.7727 14.25 12.0005 14.25C13.2283 14.25 14.2505 13.2278 14.2505 12C14.2505 10.7724 13.2274 9.75 12.0005 9.75Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.83392 12.0001C3.62458 13.5433 6.13011 17.25 12.0005 17.25C17.872 17.25 20.3748 13.5463 21.167 11.9999C20.3764 10.4567 17.8709 6.75 12.0005 6.75C6.12901 6.75 3.6262 10.4537 2.83392 12.0001ZM1.31848 11.6879C2.00694 10.1833 4.82314 5.25 12.0005 5.25C19.1779 5.25 21.9971 10.1884 22.6826 11.6882L22.8252 12.0002L22.6825 12.3121C21.994 13.8167 19.1778 18.75 12.0005 18.75C4.82309 18.75 2.00385 13.8116 1.31835 12.3118L1.17578 11.9998L1.31848 11.6879Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

export function HideFilledIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.9084 11.584C22.2034 10.039 19.3304 5 11.9994 5C11.2764 5 10.1894 5.085 9.3934 5.274L9.8564 7.219C10.3924 7.092 11.2944 6.999 12.0004 6.999C17.5764 6.999 20.0434 10.419 20.8844 11.998C20.4924 12.73 19.7104 13.935 18.3854 14.967L19.6154 16.545C21.5144 15.064 22.4944 13.321 22.9094 12.416L23.0994 12L22.9084 11.584Z"
        fill="var(--color-icon-default)"
      />
      <path
        d="M1.58539 4.414L4.51839 7.347C2.50839 8.852 1.47039 10.752 1.09039 11.584L0.900391 12L1.09039 12.416C1.79639 13.96 4.66939 19 12.0004 19C13.2994 19 14.5304 18.828 15.6794 18.507L19.5864 22.414L21.0004 21L2.99939 3L1.58539 4.414ZM11.9994 17C6.42239 17 3.95439 13.578 3.11439 12C3.55339 11.171 4.43839 9.826 5.94739 8.777L8.14439 10.974C8.05239 11.34 7.99939 11.716 7.99939 12.001C7.99939 14.207 9.79339 16.001 11.9994 16.001C12.1914 16.001 12.5914 15.976 13.0384 15.868L14.0084 16.838C13.3654 16.944 12.6954 17 11.9994 17Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

export function DoneIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.33967 10.3116L12.669 4L13.3751 4.70809L6.33372 11.7298L2.66602 8.01045L3.37805 7.30831L6.33967 10.3116Z"
        fill="white"
      />
    </svg>
  );
}

// 모달============================
export function CircleCheckFilledIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M27.9996 12.5999C19.5086 12.5999 12.5996 19.5089 12.5996 27.9999C12.5996 36.4909 19.5086 43.3999 27.9996 43.3999C36.4906 43.3999 43.3996 36.4909 43.3996 27.9999C43.3996 19.5089 36.4906 12.5999 27.9996 12.5999ZM25.6322 34.6513L20.0028 28.9435L21.9964 26.9779L25.6476 30.6809L34.0112 22.3411L35.988 24.3235L25.6322 34.6513Z"
        fill="var(--color-icon-primary)"
      />
    </svg>
  );
}

export function WarningFilledIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M43.2573 38.5001L29.2573 14.7001C28.6973 13.8601 27.2973 13.8601 26.8773 14.7001L12.7373 38.5001C12.4573 38.9201 12.4573 39.4801 12.7373 39.9001C13.0173 40.3201 13.4373 40.6001 13.9973 40.6001H41.9973C42.5573 40.6001 42.9773 40.3201 43.2573 39.9001C43.5373 39.4801 43.5373 38.9201 43.2573 38.5001ZM29.3973 35.0001H26.5973V32.2001H29.3973V35.0001ZM29.3973 30.8001H26.5973V23.8001H29.3973V30.8001Z"
        fill="#3865F3"
      />
    </svg>
  );
}

export function ToastCircleCheckFilledIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 1C5.935 1 1 5.935 1 12C1 18.065 5.935 23 12 23C18.065 23 23 18.065 23 12C23 5.935 18.065 1 12 1ZM10.309 16.751L6.288 12.674L7.712 11.27L10.32 13.915L16.294 7.958L17.706 9.374L10.309 16.751Z"
        fill="white"
      />
    </svg>
  );
}

export function CloseBigIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="cursor-pointer"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.875 22.375L22.375 11.875L23.3031 12.8031L12.8031 23.3031L11.875 22.375Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.8031 11.875L23.3031 22.375L22.375 23.3031L11.875 12.8031L12.8031 11.875Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg
      width="25"
      height="25"
      viewBox="0 0 25 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 11.5125H18.6V13.0875H6V11.5125Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.0875 6V18.6H11.5125V6H13.0875Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

// 헤더===========================
export function ArrowLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.06055 10.7803H20.0605V12.2803H5.06055V10.7803Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.12132 11.5303L12.591 5.06066L11.5303 4L4 11.5303L11.5303 19.0607L12.591 18L6.12132 11.5303Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 12.5H3V11H21V12.5Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 6.5H3V5H21V6.5Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 18.5H3V17H21V18.5Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

export function GemFilledIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M1 6.66667L6 12.6L4.2 6.66667H1Z" fill="currentColor" />
      <path
        d="M7.99999 14.6667L10.4 6.66667H5.53333L7.99999 14.6667Z"
        fill="currentColor"
      />
      <path
        d="M10.0667 5.33333L7.99999 2L5.86666 5.33333H10.0667Z"
        fill="currentColor"
      />
      <path
        d="M14.9333 5.33333L12.4667 2.26667C12.3333 2.13333 12.1333 2 11.9333 2H9.4L11.6 5.33333H14.9333Z"
        fill="currentColor"
      />
      <path d="M11.8 6.66667L10 12.6L15 6.66667H11.8Z" fill="currentColor" />
      <path
        d="M4.26667 5.33333L6.4 2H4C3.8 2 3.6 2.06667 3.46667 2.26667L1 5.33333H4.26667Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MyPageMenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.06458 5.09538C6.51364 4.56931 7.19437 4.33329 7.83366 4.33329C8.50107 4.33329 9.08712 4.58679 9.57157 5.06421C10.0976 5.51327 10.3337 6.19401 10.3337 6.83329C10.3337 7.5007 10.0802 8.08676 9.60274 8.57121C9.15368 9.09728 8.47294 9.33329 7.83366 9.33329C7.16625 9.33329 6.58019 9.0798 6.09575 8.60237C5.56967 8.15331 5.33366 7.47258 5.33366 6.83329C5.33366 6.16588 5.58715 5.57983 6.06458 5.09538ZM7.83366 5.33329C7.41345 5.33329 7.03563 5.49195 6.81777 5.75338L6.80325 5.77081L6.78721 5.78685C6.47467 6.09939 6.33366 6.44124 6.33366 6.83329C6.33366 7.2535 6.49232 7.63132 6.75375 7.84918L6.77117 7.8637L6.78721 7.87974C7.09976 8.19228 7.4416 8.33329 7.83366 8.33329C8.25387 8.33329 8.63169 8.17463 8.84955 7.9132L8.86407 7.89578L8.88011 7.87974C9.19265 7.56719 9.33366 7.22535 9.33366 6.83329C9.33366 6.41309 9.175 6.03526 8.91357 5.8174L8.89614 5.80288L8.88011 5.78685C8.56756 5.4743 8.22572 5.33329 7.83366 5.33329Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.59589 11.4518C5.31177 11.5726 5.08309 11.7328 4.94661 11.892C4.59833 12.2984 4.38407 12.7406 4.33059 13.2219L3.33671 13.1114C3.41657 12.3927 3.73564 11.7682 4.18736 11.2412C4.45088 10.9338 4.8222 10.6941 5.20475 10.5315C5.58963 10.3679 6.02276 10.2666 6.43365 10.2666H9.10032C9.95712 10.2666 10.7688 10.5809 11.3433 11.2374C11.8728 11.8426 12.1186 12.4034 12.1973 13.1114L11.2034 13.2219C11.1487 12.7298 10.9945 12.3574 10.5907 11.8959C10.2318 11.4857 9.71018 11.2666 9.10032 11.2666H6.43365C6.17788 11.2666 5.87768 11.332 5.59589 11.4518Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.83366 1.66663C4.4279 1.66663 1.66699 4.42754 1.66699 7.83329C1.66699 11.239 4.4279 14 7.83366 14C11.2394 14 14.0003 11.239 14.0003 7.83329C14.0003 4.42754 11.2394 1.66663 7.83366 1.66663ZM0.666992 7.83329C0.666992 3.87525 3.87562 0.666626 7.83366 0.666626C11.7917 0.666626 15.0003 3.87525 15.0003 7.83329C15.0003 11.7913 11.7917 15 7.83366 15C3.87562 15 0.666992 11.7913 0.666992 7.83329Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

export function LogoutMenuIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.5 2H13.8333V13.6667H5.5V11.1667H6.5V12.6667H12.8333V3H6.5V4.5H5.5V2Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6667 8.33333H2V7.33333H10.6667V8.33333Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.79289 7.83333L7.47978 5.52022L8.18688 4.81311L11.2071 7.83333L8.18688 10.8535L7.47978 10.1464L9.79289 7.83333Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

// Todo: 하나로 통일
export function CloseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 17L17 5L18.0607 6.06066L6.06066 18.0607L5 17Z"
        fill="var(--color-icon-default)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.06066 5L18.0607 17L17 18.0607L5 6.06066L6.06066 5Z"
        fill="var(--color-icon-default)"
      />
    </svg>
  );
}

// 사이드바 ===========================
export function HomeMenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.2197 2.21967C11.5126 1.92678 11.9874 1.92678 12.2803 2.21967L21.2803 11.2197C21.5732 11.5126 21.5732 11.9874 21.2803 12.2803C20.9874 12.5732 20.5126 12.5732 20.2197 12.2803L11.75 3.81066L3.28033 12.2803C2.98744 12.5732 2.51256 12.5732 2.21967 12.2803C1.92678 11.9874 1.92678 11.5126 2.21967 11.2197L11.2197 2.21967Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 19.75V9.75H5.5V19.75C5.5 19.8796 5.53991 19.9293 5.55533 19.9447C5.57075 19.9601 5.62044 20 5.75 20H17.75C17.8796 20 17.9293 19.9601 17.9447 19.9447C17.9601 19.9293 18 19.8796 18 19.75V9.75H19.5V19.75C19.5 20.2204 19.3399 20.6707 19.0053 21.0053C18.6707 21.3399 18.2204 21.5 17.75 21.5H5.75C5.27956 21.5 4.82925 21.3399 4.49467 21.0053C4.16009 20.6707 4 20.2204 4 19.75Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.75 14.5C11.0642 14.5 10.5 15.0642 10.5 15.75V20.75H9V15.75C9 14.2358 10.2358 13 11.75 13C13.2642 13 14.5 14.2358 14.5 15.75V20.75H13V15.75C13 15.0642 12.4358 14.5 11.75 14.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SocialMenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.40235 3.43707C6.2704 2.45834 7.58316 2 8.75 2C9.94772 2 11.1295 2.47754 12.0629 3.40235C13.0417 4.27041 13.5 5.58316 13.5 6.75C13.5 7.94772 13.0225 9.12946 12.0976 10.0629C11.2296 11.0417 9.91684 11.5 8.75 11.5C7.55233 11.5 6.37064 11.0225 5.43719 10.0978C4.46531 9.2371 4 8.02694 4 6.75C4 5.55228 4.47754 4.37054 5.40235 3.43707ZM8.75 3.5C7.92439 3.5 7.04658 3.83571 6.51443 4.44388L6.49799 4.46267L6.48033 4.48033C5.81649 5.14417 5.5 5.95517 5.5 6.75C5.5 7.66479 5.82864 8.44724 6.44388 8.98557L6.46267 9.00201L6.48033 9.01967C7.14417 9.68351 7.95517 10 8.75 10C9.57561 10 10.4534 9.66429 10.9856 9.05612L11.002 9.03733L11.0197 9.01967C11.6835 8.35583 12 7.54483 12 6.75C12 5.92439 11.6643 5.04658 11.0561 4.51443L11.0373 4.49799L11.0197 4.48033C10.3558 3.81649 9.54483 3.5 8.75 3.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6.75 15.5C5.95517 15.5 5.14417 15.8165 4.48033 16.4803L4.46267 16.498L4.44388 16.5144C3.82864 17.0528 3.5 17.8352 3.5 18.75V21.75H2V18.75C2 17.4731 2.46531 16.2629 3.43719 15.4022C4.37064 14.4775 5.55233 14 6.75 14H10.75C12.0269 14 13.2371 14.4653 14.0978 15.4372C15.0225 16.3706 15.5 17.5523 15.5 18.75V21.75H14V18.75C14 17.9552 13.6835 17.1442 13.0197 16.4803L13.002 16.4627L12.9856 16.4439C12.4472 15.8286 11.6648 15.5 10.75 15.5H6.75Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.3584 4.71254C16.8414 4.11691 16.2807 3.73629 15.5873 3.5822L15.9127 2.11792C17.0094 2.36163 17.8426 2.97231 18.5194 3.76197L18.541 3.78715L18.5603 3.81413C19.1494 4.63895 19.5 5.69084 19.5 6.75006C19.5 7.80928 19.1494 8.86117 18.5603 9.68599C17.9406 10.5536 16.9718 11.1468 15.9127 11.3822L15.5873 9.91792C16.3281 9.75328 16.9594 9.34655 17.3397 8.81413C17.7505 8.23895 18 7.49084 18 6.75006C18 6.02063 17.7581 5.28409 17.3584 4.71254Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.9127 14.2179C18.9718 14.4533 19.9406 15.0465 20.5603 15.9141C21.1379 16.7228 21.5 17.6724 21.5 18.75V21.75H20V18.75C20 18.0277 19.762 17.3773 19.3397 16.786C18.9594 16.2535 18.3281 15.8468 17.5873 15.6822L17.9127 14.2179Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ReportMenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 9H5V17H7V9Z" fill="currentColor" />
      <path d="M11 11H9V17H11V11Z" fill="currentColor" />
      <path d="M15 6H13V17H15V6Z" fill="currentColor" />
      <path d="M19 3H17V17H19V3Z" fill="currentColor" />
      <path d="M21 19H3V21H21V19Z" fill="currentColor" />
    </svg>
  );
}

export function CalendarMenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 8V2H17.5V8H16Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 8V2H7.5V8H6Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.75 11.75H2.75V10.25H20.75V11.75Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3.75 5.75C3.61193 5.75 3.5 5.86193 3.5 6V20C3.5 20.1381 3.61193 20.25 3.75 20.25H19.75C19.8881 20.25 20 20.1381 20 20V6C20 5.86193 19.8881 5.75 19.75 5.75H3.75ZM2 6C2 5.0335 2.7835 4.25 3.75 4.25H19.75C20.7165 4.25 21.5 5.0335 21.5 6V20C21.5 20.9665 20.7165 21.75 19.75 21.75H3.75C2.7835 21.75 2 20.9665 2 20V6Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.2833 13.5273L10.8039 18.0577L8.22559 15.5362L9.27438 14.4638L10.7861 15.9422L14.2167 12.4727L15.2833 13.5273Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function NoticeMenuIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 14H10.5V19.75C10.5 20.2204 10.3399 20.6707 10.0053 21.0053C9.67075 21.3399 9.22044 21.5 8.75 21.5H6.75C6.27956 21.5 5.82925 21.3399 5.49467 21.0053C5.16009 20.6707 5 20.2204 5 19.75V14ZM6.5 15.5V19.75C6.5 19.8796 6.53991 19.9293 6.55533 19.9447C6.57075 19.9601 6.62044 20 6.75 20H8.75C8.87956 20 8.92925 19.9601 8.94467 19.9447C8.96008 19.9293 9 19.8796 9 19.75V15.5H6.5Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1264 2.10132C18.3577 2.23551 18.5 2.48265 18.5 2.75V18.75C18.5 19.0174 18.3577 19.2645 18.1264 19.3987C17.8952 19.5329 17.61 19.5338 17.3779 19.4012L10.5508 15.5H2.75C2.33579 15.5 2 15.1642 2 14.75V6.75C2 6.33579 2.33579 6 2.75 6H10.5508L17.3779 2.09882C17.61 1.96617 17.8952 1.96713 18.1264 2.10132ZM17 4.04239L11.1221 7.40118C11.0088 7.46594 10.8805 7.5 10.75 7.5H3.5V14H10.75C10.8805 14 11.0088 14.0341 11.1221 14.0988L17 17.4576V4.04239Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 10.75C20 9.46421 19.0358 8.5 17.75 8.5V7C19.8642 7 21.5 8.63579 21.5 10.75C21.5 12.8642 19.8642 14.5 17.75 14.5V13C19.0358 13 20 12.0358 20 10.75Z"
        fill="currentColor"
      />
    </svg>
  );
}

// 홈 ===================
export function DayCheckIcon() {
  return (
    <svg
      width="31"
      height="31"
      viewBox="0 0 31 31"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.2 0C6.81927 0 0 6.81927 0 15.2C0 23.5807 6.81927 30.4 15.2 30.4C23.5807 30.4 30.4 23.5807 30.4 15.2C30.4 6.81927 23.5807 0 15.2 0ZM12.8633 21.765L7.30705 16.1313L9.27476 14.1913L12.8785 17.8462L21.1335 9.61469L23.0847 11.5713L12.8633 21.765Z"
        fill="var(--color-icon-primary)"
      />
    </svg>
  );
}

// 글쓰기 ==================
export function ChatVerificationReceptionIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="8"
      height="15"
      viewBox="0 0 8 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M0.648615 0.00353634C0.188615 -0.0464637 -0.151385 0.443536 0.0686152 0.853536C1.70862 3.87354 2.56862 8.33354 3.01862 13.3735C3.51862 18.9435 7.51862 3.94354 7.51862 3.94354C7.51862 3.94354 4.96862 0.533536 0.648615 0.00353634Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CharVerificationSendingIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      width="8"
      height="15"
      viewBox="0 0 8 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
    >
      <path
        d="M7.30986 0.00362985C7.79931 -0.0476923 8.16108 0.455265 7.92699 0.876106C6.18199 3.97596 5.26693 8.5539 4.78812 13.7272C4.2561 19.4445 0 4.04781 0 4.04781C0 4.04781 2.71327 0.547644 7.30986 0.00362985Z"
        fill="currentColor"
      />
    </svg>
  );
}
