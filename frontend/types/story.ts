export type StoryAnswer = "dream" | "real";

export type Story = {
  id: number;
  title: string;
  summary: string;
  comicImage: string;
  answer: StoryAnswer;
  revealText: string;
  tag?: string;
};
