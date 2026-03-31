export type SummarizeNoteInput = {
  title: string;
  content: string;
};

export type AiTaskResult<T> = {
  data: T;
  model: string;
};
