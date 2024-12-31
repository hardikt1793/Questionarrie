export interface Question {
  id: string;
  question: string;
  questionType: "single" | "multiple" | "open";
  options: {
    option: string;
  }[];
  createdAt: string;
  answer?: string | { [key: string]: boolean } | null;
  answeredAt?: string;
}
