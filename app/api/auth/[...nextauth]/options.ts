import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { getMongoConnection } from "@/lib/mongo";
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req): Promise<any> {
        try {
          const { email, password } = credentials || {};
          if (!email || !password) {
            throw new Error("Email and password are required");
          }

          const connection = await getMongoConnection();
          const User = connection.model("User");

          const user = await User.findOne({ email });
          if (!user || user.password !== password) {
            throw new Error("Invalid email or password");
          }

          return { id: user._id, email: user.email };
        } catch (error: any) {
          console.log(error);
          throw new Error("Invalid credentials", error);
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
        const connection = await getMongoConnection();
        const User = connection.model("User");
        if (account?.provider === "google") {
            const existingUser = await User.findOne({
                where: {
                    email: user.email!
                }
            });
            if (existingUser) {
                user.id = existingUser?.id.toString();
                user.name = existingUser.name;
                user.isVerified = existingUser.isVerified;
                return true;
            }
            else {
                try {
                    const newUser = await User.create({
                        email: user.email,
                        name: user.name || "New User",
                        isVerified: true,
                        password: await bcrypt.hash(Math.random().toString(36).slice(2) + Date.now().toString(), 10),
                    });
                    user.id = newUser._id.toString();
                    user.name = newUser.name;
                    user.isVerified = true;
                    return true;
                }
                catch (error: any) {
                    console.error("Error creating user from Google auth:", error);
                    return false;
                }
            }
        }
    },
  },
  pages: {
    signIn: "/onboarding/sign-in",
  },
};
