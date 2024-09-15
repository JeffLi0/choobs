declare module "@haelp/schedule-parse" {
  interface Course {
    course: string;
    level?: "Hon" | "AP" | "CP";
    description: string;
    room: string;
    teacher: string;
    term: "ALL" | "S 1" | "S 2";
    schedule?: string;
    credit: number;
    $: boolean;
    block: string;
  }

  type Lunch = 1 | 2 | 3;
  type APIRes = { lunches: Lunch[]; schedule: (Course | null)[] };
}
