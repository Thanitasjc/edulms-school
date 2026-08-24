"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getPostAuthRoute } from "@/features/auth/redirect";
import { registerSchema, type RegisterInput } from "@/features/auth/schemas";
import { learnerSystems } from "@/features/learning/systems";
import { useAuth } from "@/providers/auth-provider";
import { ApiClientError } from "@/lib/api-client";

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const user = await registerUser(values);
      toast.success("Account created");
      router.push(getPostAuthRoute(user));
    } catch (error) {
      const message = error instanceof ApiClientError ? error.message : "Unable to register";
      toast.error(message);
    }
  });

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <Card className="border-slate-200/80 shadow-xl dark:border-white/10">
        <CardHeader>
          <CardTitle>Create student account</CardTitle>
          <CardDescription>
            Sign up to open your student dashboard and start learning.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {(
              [
                ["name", "Full name", "text"],
                ["email", "Email", "email"],
                ["phone", "Phone", "tel"],
                ["password", "Password", "password"],
                ["password_confirmation", "Confirm password", "password"],
              ] as const
            ).map(([name, label, type]) => (
              <div className="space-y-2" key={name}>
                <Label htmlFor={name}>{label}</Label>
                <Input id={name} type={type} {...form.register(name)} />
                {form.formState.errors[name] ? (
                  <p className="text-sm text-red-500">{form.formState.errors[name]?.message}</p>
                ) : null}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Creating..." : "Create account"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div>
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Student dashboard</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight">Systems included for learners</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            After signup you land on your dashboard with these learning tools.
          </p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2">
          {learnerSystems.map((system) => {
            const Icon = system.icon;
            return (
              <li key={system.key} className="flex gap-3">
                <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10">
                  <Icon className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{system.title}</p>
                  <p className="text-xs text-slate-500">{system.titleTh}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{system.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
