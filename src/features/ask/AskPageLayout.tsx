import Container from "@/components/Container";
import { SubHeader } from "@/components/Headers";
import { AppIcon } from "@/components/AppIcon";
import { useKeyboardOffset } from "@/hooks/useKeyboardOffset";
import { useLocation, useNavigate } from "@tanstack/react-router";
import clsx from "clsx";
import { useEffect, useRef, useState, type ReactNode } from "react";

const ASK_MESSAGE_MAX_LENGTH = 200;
const ASK_TOAST_ACCESSORY_GAP = 12;

export type AskInputController = {
  value: string;
  setValue: (value: string) => void;
  focus: () => void;
  setValueAndFocus: (value: string) => void;
  isAccessoryVisible: boolean;
  setAccessoryVisible: (isVisible: boolean) => void;
};

type AskPageLayoutProps = {
  children: ReactNode | ((input: AskInputController) => ReactNode);
  onSubmit?: (message: string) => void;
  isSubmitDisabled?: boolean;
  onNewChat?: () => void;
};

// 물어보기 화면에서 공통 서브헤더, 배경, 하단 입력 액세서리를 제공합니다.
export function AskPageLayout({
  children,
  onSubmit,
  isSubmitDisabled = false,
  onNewChat,
}: AskPageLayoutProps) {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isInputAccessoryVisible, setIsInputAccessoryVisible] = useState(true);
  const [inputAccessoryHeight, setInputAccessoryHeight] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const accessoryRef = useRef<HTMLFormElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isVisible: isKeyboardVisible, bottomOffset: keyboardBottomOffset } =
    useKeyboardOffset();
  const shouldShowNewChatAction =
    !!onNewChat &&
    (location.pathname === "/ask/chat" ||
      location.pathname.startsWith("/ask/chat/"));
  const accessoryBottomPadding = isInputAccessoryVisible
    ? inputAccessoryHeight
    : 0;
  const keyboardBottomPadding =
    isKeyboardVisible && keyboardBottomOffset > 0 ? keyboardBottomOffset : 0;
  const keyboardAwareBottomPadding = `calc(${accessoryBottomPadding}px + var(--safe-bottom, 0px) + ${
    keyboardBottomPadding
  }px)`;
  const toastBottom = `calc(${accessoryBottomPadding}px + var(--safe-bottom, 0px) + ${keyboardBottomPadding}px + ${ASK_TOAST_ACCESSORY_GAP}px)`;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--ask-toast-bottom",
      toastBottom,
    );
    return () => {
      document.documentElement.style.removeProperty("--ask-toast-bottom");
    };
  }, [toastBottom]);

  useEffect(() => {
    const accessoryElement = accessoryRef.current;
    if (!accessoryElement) {
      setInputAccessoryHeight(0);
      return;
    }

    const updateAccessoryHeight = () => {
      setInputAccessoryHeight(accessoryElement.getBoundingClientRect().height);
    };

    updateAccessoryHeight();
    const resizeObserver = new ResizeObserver(updateAccessoryHeight);
    resizeObserver.observe(accessoryElement);

    return () => resizeObserver.disconnect();
  }, [isInputAccessoryVisible]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value.slice(0, ASK_MESSAGE_MAX_LENGTH));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage || isSubmitDisabled || !onSubmit) return;
    onSubmit(trimmedMessage);
    setMessage("");
  };

  const focusInput = () => {
    setIsFocused(true);
    textareaRef.current?.focus();
  };

  const setValueAndFocus = (value: string) => {
    setMessage(value.slice(0, ASK_MESSAGE_MAX_LENGTH));
    focusInput();
  };

  const inputController: AskInputController = {
    value: message,
    setValue: (value) => setMessage(value.slice(0, ASK_MESSAGE_MAX_LENGTH)),
    focus: focusInput,
    setValueAndFocus,
    isAccessoryVisible: isInputAccessoryVisible,
    setAccessoryVisible: setIsInputAccessoryVisible,
  };

  return (
    <>
      <SubHeader
        titleMeta={
          <span className="flex h-4 items-center gap-gap-x-xs rounded-full bg-surface-layer-1 px-gap-x-xs">
            <AppIcon name="message" size={10} color="current" />
            <span className="text-caption-s">9</span>
          </span>
        }
        rightActions={
          <button
            type="button"
            aria-label="대화기록 보관함"
            onClick={() => navigate({ to: "/ask/archive" })}
          >
            <AppIcon name="archive" size={24} color="current" />
          </button>
        }
      >
        수정구슬에게 물어보기
      </SubHeader>
      <Container
        hasBottomPadding={false}
        style={{ paddingBottom: keyboardAwareBottomPadding }}
        className="bg-[#E9ECFB] text-text-primary dark:bg-field-bg-muted"
      >
        {typeof children === "function" ? children(inputController) : children}
      </Container>
      {isInputAccessoryVisible && (
        <AskInputAccessory
          accessoryRef={accessoryRef}
          textareaRef={textareaRef}
          value={message}
          isFocused={isFocused}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onSubmit={handleSubmit}
          isKeyboardVisible={isKeyboardVisible}
          keyboardBottomOffset={keyboardBottomOffset}
          showNewChatAction={shouldShowNewChatAction}
          isSubmitDisabled={isSubmitDisabled}
          onNewChat={onNewChat}
        />
      )}
    </>
  );
}

type AskInputAccessoryProps = {
  accessoryRef: React.RefObject<HTMLFormElement | null>;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  value: string;
  isFocused: boolean;
  isKeyboardVisible: boolean;
  keyboardBottomOffset: number;
  showNewChatAction: boolean;
  isSubmitDisabled: boolean;
  onNewChat?: () => void;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onFocus: () => void;
  onBlur: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

// 물어보기 화면 하단에서 키보드 높이에 맞춰 입력 영역을 표시합니다.
function AskInputAccessory({
  accessoryRef,
  textareaRef,
  value,
  isFocused,
  isKeyboardVisible,
  keyboardBottomOffset,
  onChange,
  onFocus,
  onBlur,
  onSubmit,
  showNewChatAction,
  isSubmitDisabled,
  onNewChat,
}: AskInputAccessoryProps) {
  const isSubmitAllowed = value.trim().length > 0 && !isSubmitDisabled;
  const hasKeyboardOffset = isKeyboardVisible && keyboardBottomOffset > 0;

  return (
    <form
      ref={accessoryRef}
      onSubmit={onSubmit}
      style={{
        bottom: hasKeyboardOffset
          ? `${keyboardBottomOffset}px`
          : "var(--safe-bottom, 0px)",
      }}
      className="fixed inset-x-0 z-30 flex flex-col gap-gap-y-xs bg-surface-layer-1 px-padding-x-m py-padding-y-s sm:mx-auto sm:w-[412px]"
    >
      <div className="flex items-center justify-between">
        <div className="text-caption-s">
          <span className="text-text-primary">{value.length}</span>
          <span className="text-text-tertiary">
            /{ASK_MESSAGE_MAX_LENGTH}자
          </span>
        </div>
        {showNewChatAction && (
          <button
            type="button"
            onClick={onNewChat}
            className="flex items-center gap-gap-x-xxs text-button-3 text-text-secondary"
          >
            <span>새로운 대화로 시작하기</span>
            <AppIcon name="chevron-right" size={16} color="current" />
          </button>
        )}
      </div>
      <div
        className={clsx(
          "flex min-h-12 items-center gap-gap-x-s rounded-2xl border border-border-base bg-surface-base px-padding-x-s py-padding-y-xs",
          isFocused && "border-border-layer-1 bg-field-bg-default shadow-1",
        )}
      >
        <textarea
          ref={textareaRef}
          value={value}
          maxLength={ASK_MESSAGE_MAX_LENGTH}
          rows={1}
          placeholder="궁금한 내용을 적어봐요."
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          className="max-h-24 min-h-6 flex-1 resize-none bg-transparent text-caption-m text-field-text-default placeholder:text-field-text-mute focus:outline-none"
        />
        {isFocused && (
          <button
            type="submit"
            disabled={!isSubmitAllowed}
            onMouseDown={(e) => e.preventDefault()}
            className="flex size-6 shrink-0 items-center justify-center disabled:opacity-50"
            aria-label="질문 보내기"
          >
            <AppIcon name="arrow-up-circle-filled" size={24} color="default" />
          </button>
        )}
      </div>
    </form>
  );
}
