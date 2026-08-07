export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  dateLabel: string;
  author: string;
  imageUrl: string;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "education-week-news-and-views",
    title: "Education Week News and Views on Education Policy and Practice",
    excerpt:
      "Proin venenatis tincidunt ligula, in cursus neque volutpat et. Nam ut nibh porta.",
    category: "College",
    dateLabel: "June 23, 2023",
    author: "Admin",
    imageUrl:
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "the-learning-network",
    title: "The Learning Network: Teaching and Learning With The New York Times",
    excerpt:
      "Proin venenatis tincidunt ligula, in cursus neque volutpat et. Nam ut nibh porta.",
    category: "High School",
    dateLabel: "June 23, 2023",
    author: "Admin",
    imageUrl:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "nothing-is-impossible-to-learn",
    title: "Nothing is Impossible to Learn If You are Passionate About This Subject",
    excerpt:
      "Proin venenatis tincidunt ligula, in cursus neque volutpat et. Nam ut nibh porta.",
    category: "Primary",
    dateLabel: "June 23, 2023",
    author: "Admin",
    imageUrl:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80",
  },
];
