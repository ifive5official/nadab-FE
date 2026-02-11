import { queryOptions } from "@tanstack/react-query";
import type { ApiResponse } from "@/generated/api";
import { api } from "@/lib/axios";
import type { components } from "@/generated/api-types";
import axios from "axios";

type QuestionRes = components["schemas"]["DailyQuestionResponse"];

export const questionOptions = queryOptions({
  queryKey: ["currentUser", "question"],
  queryFn: async () => {
    try {
      const res = await api.get<ApiResponse<QuestionRes>>("/api/v1/question");
      return res.data.data!;
    } catch (err) {
      if (
        axios.isAxiosError(err) &&
        err.response?.data?.code === "QUESTION_NOT_FOUND_FOR_CONDITION"
      ) {
        return null;
      }
      throw err;
    }
  },
});
