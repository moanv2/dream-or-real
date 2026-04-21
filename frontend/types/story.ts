export type StoryAnswer = "dream" | "real";
export type SubmissionOutcome = "approved" | "rejected" | "needs_review" | "processing_failed";
export type StoryStatus = "approved" | "rejected" | "needs_review" | "processing_failed";
export type ProcessingState = "pending" | "filtered" | "rewritten" | "comic_generated" | "failed";

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
  display_text: string;
  comic_image_url: string | null;
  reveal_text: string;
  original_text: string;
  attachments: StoryAttachment[];
};

export type StorySubmissionRequest = {
  text: string;
  label: StoryAnswer;
  attachments?: File[];
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
  moderation_reason: string | null;
  moderation_category: string | null;
  status: StoryStatus;
  processing_state: ProcessingState | null;
  created_at: string;
};

export type StoryAttachment = {
  id: number;
  url: string;
  mime_type: string;
  original_filename: string | null;
};

export type StorySubmissionResponse = {
  outcome: SubmissionOutcome;
  message: string;
  story: StoryCreated;
};
