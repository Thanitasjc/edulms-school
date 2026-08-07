"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminQuiz, deleteAdminQuiz, listAdminQuizzes } from "@/features/quiz/api";
import { listAdminCourses } from "@/features/courses/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ApiClientError } from "@/lib/api-client";

export default function ManageQuizzesPage() {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [passPercentage, setPassPercentage] = useState("70");
  const [question, setQuestion] = useState("");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctOption, setCorrectOption] = useState("A");

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ["admin-quizzes"],
    queryFn: async () => {
      const response = await listAdminQuizzes();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-courses-select"],
    queryFn: async () => {
      const response = await listAdminCourses();
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const createMutation = useMutation({
    mutationFn: () =>
      createAdminQuiz({
        course_id: Number(courseId),
        title: title.trim(),
        pass_percentage: Number(passPercentage) || 70,
        status: "published",
        questions: [
          {
            question: question.trim(),
            options: [
              { key: "A", text: optionA.trim() },
              { key: "B", text: optionB.trim() },
              { key: "C", text: optionC.trim() },
              { key: "D", text: optionD.trim() },
            ],
            correct_option: correctOption,
            sort_order: 1,
          },
        ],
      }),
    onSuccess: () => {
      toast.success("Quiz created");
      setTitle("");
      setQuestion("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      void queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Create failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminQuiz(id),
    onSuccess: () => {
      toast.success("Quiz deleted");
      void queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? err.message : "Delete failed"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Quizzes</h1>
        <p className="mt-1 text-sm text-slate-500">Create and manage course quizzes.</p>
      </div>

      <form
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900"
        onSubmit={(event) => {
          event.preventDefault();
          if (!courseId || !title.trim() || !question.trim()) return;
          createMutation.mutate();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <select
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm dark:border-white/10 dark:bg-slate-950"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            required
          >
            <option value="">Select course</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
          <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <Input
            type="number"
            min={1}
            max={100}
            placeholder="Pass %"
            value={passPercentage}
            onChange={(e) => setPassPercentage(e.target.value)}
          />
        </div>

        <Textarea
          rows={2}
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Input placeholder="Option A" value={optionA} onChange={(e) => setOptionA(e.target.value)} required />
          <Input placeholder="Option B" value={optionB} onChange={(e) => setOptionB(e.target.value)} required />
          <Input placeholder="Option C" value={optionC} onChange={(e) => setOptionC(e.target.value)} required />
          <Input placeholder="Option D" value={optionD} onChange={(e) => setOptionD(e.target.value)} required />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-slate-600 dark:text-slate-300">
            Correct answer
            <select
              className="ml-2 rounded-lg border border-slate-200 bg-white px-2 py-1 dark:border-white/10 dark:bg-slate-950"
              value={correctOption}
              onChange={(e) => setCorrectOption(e.target.value)}
            >
              {["A", "B", "C", "D"].map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={createMutation.isPending}>
            Create quiz
          </Button>
        </div>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-slate-900">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-500">Loading...</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Course ID</TableHead>
                <TableHead>Pass %</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>{quiz.course_id}</TableCell>
                  <TableCell>{quiz.pass_percentage}%</TableCell>
                  <TableCell>{quiz.questions?.length ?? "—"}</TableCell>
                  <TableCell>{quiz.status}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm(`Delete quiz "${quiz.title}"?`)) deleteMutation.mutate(quiz.id);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {quizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No quizzes yet.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
