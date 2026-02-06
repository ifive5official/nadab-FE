// 회원가입, 닉네임 변경 등 유저 정보를 form으로 받아야 할 때
// 검증하기 위한 스키마
import { z } from "zod";

export const UserSchema = z.object({
  nickname: z
    .string()
    .min(2, { message: "닉네임은 2글자 이상이어야 해요." })
    .max(10, { message: "닉네임은 10자 이하여야 해요." })
    .regex(/^\S+$/, {
      message: "닉네임에 공백을 포함할 수 없어요.",
    })
    .regex(/^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z]+$/, {
      message: "닉네임은 한글/영문만 사용할 수 있어요.",
    }),
  email: z.string().email({ message: "올바른 이메일 형식이 아니에요." }),
  password: z
    .string()
    .min(8, { message: "비밀번호는 8자 이상이어야 해요." })
    .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, {
      message: "비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 해요.",
    }),
});
