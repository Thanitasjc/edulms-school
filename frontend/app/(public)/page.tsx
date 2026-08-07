import { AboutSection } from "@/components/public/about-section";
import { AdmissionSection } from "@/components/public/admission-section";
import { CategoryGrid } from "@/components/public/category-grid";
import { FeaturedCoursesSection } from "@/components/public/featured-courses-section";
import { HeroBanner } from "@/components/public/hero-banner";
import { LatestNewsSection } from "@/components/public/latest-news-section";
import { TeachersSection } from "@/components/public/teachers-section";

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <AboutSection />
      <CategoryGrid />
      <FeaturedCoursesSection />
      <AdmissionSection />
      <TeachersSection />
      <LatestNewsSection />
    </>
  );
}
