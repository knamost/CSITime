import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { z } from "zod"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = z
          .object({
            email: z.string(),
            password: z.string().min(6),
          })
          .safeParse(credentials)

        if (!parsed.success) return null

        const { email, password } = parsed.data

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email },
              { username: email },
            ],
          },
        })

        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          currentSemester: user.currentSemester,
          currentElective: user.currentElective,
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
        token.currentSemester = (user as any).currentSemester
        token.currentElective = (user as any).currentElective
        token.username = (user as any).username
      }
      return token
    },
    session({ session, token }) {
      session.user.id = token.id as string
      session.user.role = token.role as string
      session.user.currentSemester = token.currentSemester as number | null
      session.user.currentElective = token.currentElective as string | null
      session.user.username = token.username as string | null
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
})
