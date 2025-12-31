import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";

type QuestionRes = components["schemas"]["DailyQuestionResponse"];

export const questionOptions = queryOptions({
  queryKey: ["currentUser", "question"],
  queryFn: async () => {
    const res = await api.get<ApiResponse<QuestionRes>>("/api/v1/question");
    return res.data.data;
  },
});
