export type HeroSlide = {
  id: string;
  subtitle: string;
  title: string;
  titleAccent: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  imageUrl: string;
};

/**
 * Public hero slides.
 * Replace with Setting/CMS API later — keep structure API-ready.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "campus",
    subtitle: "New journey for your academy",
    title: "Welcome to Our",
    titleAccent: "Learning Platform",
    description:
      "Build curriculum, enroll learners, and deliver courses across schools, universities, and enterprise academies.",
    ctaLabel: "Learn More",
    ctaHref: "/about",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "courses",
    subtitle: "Online education that scales",
    title: "Choose Online",
    titleAccent: "Video Courses",
    description:
      "Publish structured lessons, track progress, and help learners complete programs with confidence.",
    ctaLabel: "Explore Courses",
    ctaHref: "/courses",
    imageUrl:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2400&q=80",
  },
  {
    id: "instructors",
    subtitle: "Teach with clarity and impact",
    title: "Empower Your",
    titleAccent: "Instructors",
    description:
      "Give teachers a modern workspace to create content, assess learners, and issue certificates.",
    ctaLabel: "Get Started",
    ctaHref: "/register",
    imageUrl:
      "https://images.unsplash.com/photo-1427504490302-d9a1a7a7a1e8?auto=format&fit=crop&w=2400&q=80",
  },
];
