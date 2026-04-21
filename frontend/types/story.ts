export type StoryAnswer = "dream" | "real";

export type StorySummary = {
  id: number;
  title: string | null;
  display_text: string;
  comic_image_url: string | null;
  source: "seed" | "user";
};

export type StoryReveal = {
  id: number;
  title: string | null;
  label: StoryAnswer;
  source: "seed" | "user";
  comic_image_url: string | null;
  reveal_text: string;
  original_text: string;
};

export type StorySubmissionRequest = {
  title?: string;
  text: string;
  label: StoryAnswer;
  reveal_text?: string;
};

export type StoryCreated = {
  id: number;
  title: string | null;
  slug: string;
  source: "seed" | "user";
  label: StoryAnswer;
  display_text: string;
  reveal_text: string | null;
  comic_image_url: string | null;
  status: string;
  created_at: string;
};
