"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageBreadcrumb } from "@/components/public/page-breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createPublicLead } from "@/features/crm/api";
import { ApiClientError } from "@/lib/api-client";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mutation = useMutation({
    mutationFn: () =>
      createPublicLead({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        subject: subject.trim() || undefined,
        message: message.trim(),
      }),
    onSuccess: () => {
      toast.success("Message sent. We'll get back to you soon.");
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    },
    onError: (err) => {
      toast.error(err instanceof ApiClientError ? err.message : "Could not send message");
    },
  });

  return (
    <>
      <PageBreadcrumb title="Contact" items={[{ label: "Contact" }]} />
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Get in touch</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Have a question about admissions or courses? Send us a message and our team will respond shortly.
          </p>

          <form
            className="mt-8 space-y-4 rounded-[1.75rem] border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-slate-950"
            onSubmit={(event) => {
              event.preventDefault();
              if (!name.trim() || !email.trim() || !message.trim()) return;
              mutation.mutate();
            }}
          >
            <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <Input placeholder="Subject (optional)" value={subject} onChange={(e) => setSubject(e.target.value)} />
            <Textarea
              rows={5}
              placeholder="Your message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
            <Button type="submit" className="w-full rounded-full" disabled={mutation.isPending}>
              {mutation.isPending ? "Sending..." : "Send message"}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
