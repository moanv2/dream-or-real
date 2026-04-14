import type { Story } from "@/types/story";

export const mockStories: Story[] = [
  {
    id: 1,
    title: "The Fish That Rode the Night Bus",
    summary:
      "A woman swore she saw a man in a raincoat board the last bus carrying a goldfish bowl, whisper to it like a therapist, then get off exactly one stop later.",
    comicImage: "/comics/night-bus-fish.svg",
    answer: "real",
    revealText:
      "Inspired by real urban-news oddities. The scene sounds invented, but stranger late-night public transit stories have genuinely made local headlines.",
    tag: "Transit",
  },
  {
    id: 2,
    title: "The Office Volcano Drill",
    summary:
      "During a routine meeting, a manager announced everyone should calmly evacuate because a miniature volcano had formed beside the printer and was becoming emotional.",
    comicImage: "/comics/office-volcano.svg",
    answer: "dream",
    revealText:
      "No newsroom clipping here. This one leans into classic dream logic: workplace normalcy, escalating absurdity, and everyone acting like it is standard procedure.",
    tag: "Workday",
  },
  {
    id: 3,
    title: "Goat in the Apartment Elevator",
    summary:
      "Residents in a city tower found an extremely calm goat riding the elevator alone between floors for almost twenty minutes before anyone claimed it.",
    comicImage: "/comics/elevator-goat.svg",
    answer: "real",
    revealText:
      "Versions of this have actually happened. Loose animals in apartment buildings sound like cartoon material until someone posts the security footage.",
    tag: "Animal",
  },
  {
    id: 4,
    title: "The Penguin Board Meeting",
    summary:
      "You arrive late to work and discover twelve penguins in ties reviewing a quarterly deck. Nobody explains why, but your slide is apparently weak.",
    comicImage: "/comics/penguin-boardroom.svg",
    answer: "dream",
    revealText:
      "A dead giveaway. The social anxiety is real, but the corporate penguin tribunal is pure dream construction.",
    tag: "Boardroom",
  },
  {
    id: 5,
    title: "Sleepwalking Into a Library Lecture",
    summary:
      "A student reportedly wandered into a late-night campus talk while sleepwalking, sat through half of it, and only woke up when the audience applauded.",
    comicImage: "/comics/library-sleepwalk.svg",
    answer: "real",
    revealText:
      "Sleepwalking stories can get surprisingly specific. This one fits the kind of odd but plausible campus event that ends up in student papers.",
    tag: "Campus",
  },
];
