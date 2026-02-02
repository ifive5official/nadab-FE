// 회원가입/로그인/프로필 수정에서 유저 정보 관련 필드 검증하는 로직
import { useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";
import { UserSchema } from "@/features/user/userSchema";

export function useInputValidation(
  field: keyof z.input<typeof UserSchema>,
  initialValue?: string,
) {
  const [value, setValue] = useState(initialValue ?? "");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  // 입력 후 일정 시간이 지나고 검증
  const validate = useDebouncedCallback((v: string) => {
    const schema = UserSchema.pick({ [field]: true });
    const result = schema.safeParse({ [field]: v });
    if (!result.success) {
      setError(result.error.issues[0].message);
    } else {
      setError("");
    }
    setIsValidating(false);
  }, 300);

  function onChange(v: string) {
    setValue(v);
    setError(""); // 입력 중 에러 문구 X
    setIsValidating(true);
    validate(v);
  }

  return { value, error, onChange, validate, isValidating, setError };
}

export function useConfirmPasswordValidation(password: string) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [isValidating, setIsValidating] = useState(false);

  const validate = useDebouncedCallback(() => {
    if (value !== password) {
      setError("같은 비밀번호를 재입력해주세요.");
    } else {
      setError("");
    }
    setIsValidating(false);
  }, 300);

  function onChange(v: string) {
    setValue(v);
    setError(""); // 입력 중 에러 문구 X
    setIsValidating(true);
    validate();
  }

  return { value, error, onChange, validate, isValidating };
}
