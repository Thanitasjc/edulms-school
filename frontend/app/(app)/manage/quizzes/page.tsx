"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { listAdminCourses } from "@/features/courses/api";
import {
  createAdminQuiz,
  deleteAdminQuiz,
  getAdminQuiz,
  listAdminQuizzes,
  updateAdminQuiz,
  type Quiz,
  type QuizQuestion,
} from "@/features/quiz/api";
import { useAuth } from "@/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

type QuestionForm = {
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct_option: string;
};

type QuizFormState = {
  course_id: string;
  title: string;
  description: string;
  pass_percentage: string;
  status: string;
  questions: QuestionForm[];
};

const emptyQuestion = (): QuestionForm => ({
  question: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correct_option: "A",
});

const emptyForm = (): QuizFormState => ({
  course_id: "",
  title: "",
  description: "",
  pass_percentage: "70",
  status: "published",
  questions: [emptyQuestion()],
});

function questionFromApi(question: QuizQuestion): QuestionForm {
  const options = Array.isArray(question.options) ? question.options : [];
  const byKey = Object.fromEntries(options.map((option) => [option.key, option.text]));

  return {
    question: question.question ?? "",
    optionA: byKey.A ?? options[0]?.text ?? "",
    optionB: byKey.B ?? options[1]?.text ?? "",
    optionC: byKey.C ?? options[2]?.text ?? "",
    optionD: byKey.D ?? options[3]?.text ?? "",
    correct_option: question.correct_option || "A",
  };
}

function toFormState(quiz: Quiz): QuizFormState {
  const questions = (quiz.questions ?? []).map(questionFromApi);

  return {
    course_id: String(quiz.course_id),
    title: quiz.title ?? "",
    description: quiz.description ?? "",
    pass_percentage: String(quiz.pass_percentage ?? 70),
    status: quiz.status || "published",
    questions: questions.length > 0 ? questions : [emptyQuestion()],
  };
}

function toQuestionsPayload(questions: QuestionForm[]): QuizQuestion[] {
  return questions.map((item, index) => ({
    question: item.question.trim(),
    options: [
      { key: "A", text: item.optionA.trim() },
      { key: "B", text: item.optionB.trim() },
      { key: "C", text: item.optionC.trim() },
      { key: "D", text: item.optionD.trim() },
    ],
    correct_option: item.correct_option,
    sort_order: index + 1,
  }));
}

function statusVariant(status: string) {
  if (status === "published") return "default" as const;
  if (status === "archived") return "destructive" as const;
  return "secondary" as const;
}

export default function ManageQuizzesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState<QuizFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const can = (permission: string) =>
    Boolean(user?.is_super_admin || user?.permissions.includes(permission));

  const queryKey = useMemo(
    () => ["admin-quizzes", statusFilter] as const,
    [statusFilter],
  );

  const { data: quizzes = [], isLoading, isError, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const response = await listAdminQuizzes({
        status: statusFilter === "all" ? undefined : statusFilter,
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-select"],
    queryFn: async () => {
      const response = await listAdminCourses({ page: 1 });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const courseTitleById = useMemo(
    () => Object.fromEntries(courses.map((course) => [course.id, course.title])),
    [courses],
  );

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm());
  };

  const setField = <K extends keyof QuizFormState>(key: K, value: QuizFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updateQuestion = (index: number, patch: Partial<QuestionForm>) => {
    setForm((current) => ({
      ...current,
      questions: current.questions.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question,
      ),
    }));
  };

  const loadForEdit = async (quiz: Quiz) => {
    try {
      const response = await getAdminQuiz(quiz.id);
      setEditingId(quiz.id);
      setForm(toFormState(response.data));
    } catch (err) {
      toast.error(err instanceof ApiClientError ? err.message : "Failed to load quiz");
    }
  };

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        course_id: Number(form.course_id),
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        pass_percentage: Number(form.pass_percentage) || 70,
        status: form.status,
        questions: toQuestionsPayload(form.questions),
      };

      return editingId
        ? updateAdminQuiz(editingId, payload)
        : createAdminQuiz(payload);
    },
    onSuccess: () => {
      toast.success(editingId ? "Quiz updated" : "Quiz created");
      resetForm();
      void queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Save failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminQuiz(id),
    onSuccess: (_, id) => {
      toast.success("Quiz deleted");
      if (editingId === id) {
        resetForm();
      }
      void queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Delete failed");
    },
  });

  const filteredQuizzes = quizzes.filter((quiz) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const courseTitle = (courseTitleById[quiz.course_id] ?? "").toLowerCase();
    return quiz.title.toLowerCase().includes(q) || courseTitle.includes(q);
  });

  const canSave =
    Boolean(form.course_id) &&
    Boolean(form.title.trim()) &&
    form.questions.every(
      (item) =>
        item.question.trim() &&
        item.optionA.trim() &&
        item.optionB.trim() &&
        item.optionC.trim() &&
        item.optionD.trim(),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit, and delete course quizzes with multiple questions.
          </p>
        </div>
        {editingId ? (
          <Button variant="outline" onClick={resetForm}>
            <Plus className="size-4" />
            New quiz
          </Button>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,480px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{editingId ? "Edit quiz" : "New quiz"}</h2>
            <p className="mt-1 text-sm text-slate-500">
              {editingId ? `Editing #${editingId}` : "Attach a quiz to a course and add questions."}
            </p>
          </div>

          {can(editingId ? "quiz.update" : "quiz.create") ? (
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                if (!canSave) return;
                saveMutation.mutate();
              }}
            >
              <Field label="Course">
                <Select
                  value={form.course_id || undefined}
                  onValueChange={(value) => setField("course_id", value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={String(course.id)}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Title">
                <Input
                  placeholder="Quiz title"
                  value={form.title}
                  onChange={(event) => setField("title", event.target.value)}
                  required
                />
              </Field>

              <Field label="Description">
                <Textarea
                  rows={2}
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(event) => setField("description", event.target.value)}
                />
              </Field>

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Pass %">
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.pass_percentage}
                    onChange={(event) => setField("pass_percentage", event.target.value)}
                  />
                </Field>
                <Field label="Status">
                  <Select
                    value={form.status}
                    onValueChange={(value) => setField("status", value ?? "published")}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-medium">Questions</h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        questions: [...current.questions, emptyQuestion()],
                      }))
                    }
                  >
                    <Plus className="size-4" />
                    Add question
                  </Button>
                </div>

                {form.questions.map((item, index) => (
                  <div
                    key={index}
                    className="space-y-3 rounded-xl border border-slate-200 p-3 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium">Question {index + 1}</p>
                      {form.questions.length > 1 ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setForm((current) => ({
                              ...current,
                              questions: current.questions.filter((_, i) => i !== index),
                            }))
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      ) : null}
                    </div>

                    <Textarea
                      rows={2}
                      placeholder="Question"
                      value={item.question}
                      onChange={(event) => updateQuestion(index, { question: event.target.value })}
                      required
                    />

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Input
                        placeholder="Option A"
                        value={item.optionA}
                        onChange={(event) => updateQuestion(index, { optionA: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Option B"
                        value={item.optionB}
                        onChange={(event) => updateQuestion(index, { optionB: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Option C"
                        value={item.optionC}
                        onChange={(event) => updateQuestion(index, { optionC: event.target.value })}
                        required
                      />
                      <Input
                        placeholder="Option D"
                        value={item.optionD}
                        onChange={(event) => updateQuestion(index, { optionD: event.target.value })}
                        required
                      />
                    </div>

                    <Field label="Correct answer">
                      <Select
                        value={item.correct_option}
                        onValueChange={(value) =>
                          updateQuestion(index, { correct_option: value ?? "A" })
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Correct option" />
                        </SelectTrigger>
                        <SelectContent>
                          {["A", "B", "C", "D"].map((key) => (
                            <SelectItem key={key} value={key}>
                              {key}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saveMutation.isPending || !canSave}>
                  {saveMutation.isPending
                    ? "Saving..."
                    : editingId
                      ? "Update quiz"
                      : "Create quiz"}
                </Button>
                {editingId ? (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="text-sm text-slate-500">You do not have permission to manage quizzes.</p>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search quiz or course..."
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "all")}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
            {isLoading ? (
              <p className="p-6 text-sm text-slate-500">Loading...</p>
            ) : isError ? (
              <p className="p-6 text-sm text-red-500">
                {error instanceof ApiClientError ? error.message : "Failed to load"}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Pass %</TableHead>
                    <TableHead>Questions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuizzes.map((quiz) => (
                    <TableRow key={quiz.id}>
                      <TableCell className="font-medium">{quiz.title}</TableCell>
                      <TableCell>
                        {courseTitleById[quiz.course_id] ?? `Course #${quiz.course_id}`}
                      </TableCell>
                      <TableCell>{quiz.pass_percentage}%</TableCell>
                      <TableCell>{quiz.questions?.length ?? 0}</TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(quiz.status)}>{quiz.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex gap-2">
                          {can("quiz.update") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => void loadForEdit(quiz)}
                            >
                              <Pencil className="size-4" />
                            </Button>
                          ) : null}
                          {can("quiz.delete") ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                if (confirm(`Delete quiz "${quiz.title}"?`)) {
                                  deleteMutation.mutate(quiz.id);
                                }
                              }}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredQuizzes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                        No quizzes found.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
