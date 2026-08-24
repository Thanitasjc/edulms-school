import {
  Award,
  BookOpen,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  Newspaper,
  ShoppingBag,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";

export type LearnerSystem = {
  key: string;
  href: string;
  title: string;
  titleTh: string;
  description: string;
  icon: LucideIcon;
};

/** Learner-facing systems students get after signup. */
export const learnerSystems: LearnerSystem[] = [
  {
    key: "dashboard",
    href: "/my-dashboard",
    title: "Student dashboard",
    titleTh: "แดชบอร์ดนักเรียน",
    description: "Overview of courses, progress, quizzes, and certificates.",
    icon: LayoutDashboard,
  },
  {
    key: "courses",
    href: "/courses",
    title: "Course catalog",
    titleTh: "คลังคอร์ส",
    description: "Browse and enroll in published courses.",
    icon: BookOpen,
  },
  {
    key: "learning",
    href: "/my-courses",
    title: "My Learning",
    titleTh: "การเรียนของฉัน",
    description: "Continue lessons and track completion.",
    icon: TrendingUp,
  },
  {
    key: "quiz",
    href: "/my-courses",
    title: "Quizzes",
    titleTh: "แบบทดสอบ",
    description: "Take course quizzes and see your results.",
    icon: ClipboardList,
  },
  {
    key: "certificate",
    href: "/certificates",
    title: "Certificates",
    titleTh: "ใบรับรอง",
    description: "Earn and download certificates after you pass.",
    icon: Award,
  },
  {
    key: "instructors",
    href: "/instructors",
    title: "Instructors",
    titleTh: "วิทยากร",
    description: "Learn from teacher profiles on the public site.",
    icon: GraduationCap,
  },
  {
    key: "blog",
    href: "/blog",
    title: "Blog",
    titleTh: "บล็อก",
    description: "Read school news and learning articles.",
    icon: Newspaper,
  },
  {
    key: "checkout",
    href: "/cart",
    title: "Enrollment / checkout",
    titleTh: "ลงทะเบียนเรียน",
    description: "Add courses to cart and pay with Stripe (or demo pay locally).",
    icon: ShoppingBag,
  },
];
