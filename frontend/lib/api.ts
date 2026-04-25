import type {
  StoryReveal,
  StorySubmissionRequest,
  StorySubmissionResponse,
  StorySummary,
} from "@/types/story";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

async function parseError(response: Response, fallback: string): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
    if (Array.isArray(body?.detail)) return body.detail.map((d: { msg?: string }) => d.msg).filter(Boolean).join(", ");
  } catch {
    // ignore
  }
  return fallback;
}

export async function getRandomStory(): Promise<StorySummary> {
  const response = await fetch(`${API_BASE}/api/stories/random`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to load a story."));
  }
  return response.json();
}

export async function revealStory(storyId: number): Promise<StoryReveal> {
  const response = await fetch(`${API_BASE}/api/stories/${storyId}/reveal`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to reveal story."));
  }
  return response.json();
}

export async function submitStory(submission: StorySubmissionRequest): Promise<StorySubmissionResponse> {
  const formData = new FormData();
  formData.append("text", submission.text);
  formData.append("label", submission.label);
  for (const file of submission.attachments ?? []) {
    formData.append("attachments", file);
  }

  const response = await fetch(`${API_BASE}/api/stories/submit`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(await parseError(response, "Failed to submit story."));
  }
  return response.json();
}
