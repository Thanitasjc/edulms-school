export type Instructor = {
  slug: string;
  name: string;
  role: string;
  subtitle: string;
  imageUrl: string;
  rating: number;
  reviewsCount: number;
  about: string[];
  address: string;
  email: string;
  phone: string;
  skillLabels: string[];
};

export const instructors: Instructor[] = [
  {
    slug: "parsley-montana",
    name: "Parsley Montana",
    role: "Lead Teacher",
    subtitle: "Lead Teacher, Researcher",
    imageUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80",
    rating: 5,
    reviewsCount: 3,
    about: [
      "Lorem ipsum dolor sit amet, consectetur elit sed do eius mod tempor incidid labore dolore magna aliqua. enim ad minim eniam quis nostrud exercitation ullamco laboris nisi aliquip ex commodo consequat. duis aute irure dolor in repreed ut perspiciatis unde omnis iste natus error sit voluptat em acus antium.",
      "doloremque laudantium totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi arch itecto beatae vitae dicta sunt explicabo.",
    ],
    address: "Hilton Conference Centre",
    email: "parsley@demo-academy.test",
    phone: "+123 548 6458 50",
    skillLabels: ["Teaching", "Curriculum", "Research"],
  },
  {
    slug: "lana-pierce",
    name: "Lana Pierce",
    role: "Science Teacher",
    subtitle: "Science Teacher, STEM Mentor",
    imageUrl:
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 12,
    about: [
      "Lana helps learners build strong foundations in science through practical experiments and clear explanations.",
      "She focuses on curiosity-driven learning and real-world STEM applications.",
    ],
    address: "Science Wing, Demo Academy",
    email: "lana@demo-academy.test",
    phone: "+123 548 6458 51",
    skillLabels: ["Biology", "Chemistry", "STEM"],
  },
  {
    slug: "marcus-lin",
    name: "Marcus Lin",
    role: "Math Instructor",
    subtitle: "Math Instructor, Problem Solver",
    imageUrl:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80",
    rating: 4.8,
    reviewsCount: 18,
    about: [
      "Marcus specializes in making advanced mathematics approachable for every learner.",
      "His courses emphasize step-by-step reasoning and confident problem solving.",
    ],
    address: "Math Lab, Demo Academy",
    email: "marcus@demo-academy.test",
    phone: "+123 548 6458 52",
    skillLabels: ["Algebra", "Calculus", "Statistics"],
  },
  {
    slug: "amira-wallace",
    name: "Amira Wallace",
    role: "Art Coach",
    subtitle: "Art Coach, Creative Director",
    imageUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=800&q=80",
    rating: 5,
    reviewsCount: 9,
    about: [
      "Amira mentors students through visual storytelling, design systems, and creative practice.",
      "Her sessions blend critique with practical studio workflows.",
    ],
    address: "Creative Studio, Demo Academy",
    email: "amira@demo-academy.test",
    phone: "+123 548 6458 53",
    skillLabels: ["Design", "Illustration", "Critique"],
  },
  {
    slug: "jonas-reid",
    name: "Jonas Reid",
    role: "History Expert",
    subtitle: "History Expert, Author",
    imageUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
    rating: 4.7,
    reviewsCount: 7,
    about: [
      "Jonas brings history to life with narrative teaching and source-based learning.",
      "Students leave with context, critical thinking, and stronger research habits.",
    ],
    address: "Humanities Hall, Demo Academy",
    email: "jonas@demo-academy.test",
    phone: "+123 548 6458 54",
    skillLabels: ["History", "Research", "Writing"],
  },
  {
    slug: "nora-chase",
    name: "Nora Chase",
    role: "Creative Writing Mentor",
    subtitle: "Creative Writing Mentor, Editor",
    imageUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    rating: 4.9,
    reviewsCount: 14,
    about: [
      "Nora coaches writers on voice, structure, and revision craft.",
      "Her workshops help learners publish with confidence and clarity.",
    ],
    address: "Writing Center, Demo Academy",
    email: "nora@demo-academy.test",
    phone: "+123 548 6458 55",
    skillLabels: ["Writing", "Editing", "Storytelling"],
  },
];

export function getInstructorBySlug(slug: string): Instructor | undefined {
  return instructors.find((instructor) => instructor.slug === slug);
}
