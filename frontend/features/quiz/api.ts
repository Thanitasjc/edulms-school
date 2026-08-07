import { apiClient } from "@/lib/api-client";
import { getStoredCompanyId, getStoredToken } from "@/features/auth/api";

export type QuizQuestionOption = { key: string; text: string };

export type QuizQuestion = {
  id?: number;
  question: string;
  options: QuizQuestionOption[];
  correct_option?: string;
  sort_order?: number;
};

export type Quiz = {
  id: number;
  company_id?: number;
  course_id: number;
  title: string;
  description?: string | null;
  pass_percentage: number;
  lesson_key?: string | null;
  is_final_quiz?: boolean;
  status: string;
  questions?: QuizQuestion[];
  created_at?: string | null;
  updated_at?: string | null;
};

export type QuizAttempt = {
  id: number;
  quiz_id: number;
  course_id: number;
  user_id: number;
  score: number;
  passed: boolean;
  answers?: Record<string, string>;
  completed_at?: string | null;
  created_at?: string | null;
};

export type QuizAttemptResult = {
  score: number;
  passed: boolean;
  attempt: QuizAttempt;
};

function authOptions() {
  return {
    token: getStoredToken(),
    companyId: getStoredCompanyId(),
  };
}

export async function listPublicCourseQuizzes(slug: string) {
  return apiClient<Quiz[]>(`/public/courses/${slug}/quizzes`, { token: getStoredToken() });
}

export async function getPublicQuiz(id: number | string) {
  return apiClient<Quiz>(`/public/quizzes/${id}`, { token: getStoredToken() });
}

export async function submitQuizAttempt(quizId: number | string, answers: Record<string, string>) {
  return apiClient<QuizAttemptResult>(`/public/quizzes/${quizId}/attempts`, {
    token: getStoredToken(),
    method: "POST",
    body: { answers },
  });
}

export async function listAdminQuizzes(params?: { course_id?: number; status?: string; page?: number }) {
  const query = new URLSearchParams();
  query.set("per_page", "20");
  query.set("sort", "updated_at");
  query.set("direction", "desc");
  if (params?.course_id) query.set("filters[course_id]", String(params.course_id));
  if (params?.status) query.set("filters[status]", params.status);
  if (params?.page) query.set("page", String(params.page));

  return apiClient<Quiz[]>(`/quizzes?${query.toString()}`, authOptions());
}

export async function getAdminQuiz(id: number | string) {
  return apiClient<Quiz>(`/quizzes/${id}`, authOptions());
}

export async function createAdminQuiz(input: {
  course_id: number;
  title: string;
  description?: string;
  pass_percentage?: number;
  lesson_key?: string;
  status?: string;
  questions: QuizQuestion[];
}) {
  return apiClient<Quiz>("/quizzes", { ...authOptions(), method: "POST", body: input });
}

export async function updateAdminQuiz(
  id: number | string,
  input: Partial<{
    course_id: number;
    title: string;
    description: string;
    pass_percentage: number;
    lesson_key: string;
    status: string;
    questions: QuizQuestion[];
  }>,
) {
  return apiClient<Quiz>(`/quizzes/${id}`, { ...authOptions(), method: "PUT", body: input });
}

export async function deleteAdminQuiz(id: number | string) {
  return apiClient<null>(`/quizzes/${id}`, { ...authOptions(), method: "DELETE" });
}
