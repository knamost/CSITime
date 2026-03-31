import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      currentSemester: number | null
      currentElective: string | null
      username: string | null
    } & DefaultSession["user"]
  }
}
