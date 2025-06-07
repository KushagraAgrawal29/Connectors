import { getMongoConnection } from "@/lib/mongo";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse, NextRequest } from "next/server";

interface SignupRequest {
  email: string
  password: string
  username: string
}

export async function POST(req: NextRequest) {
  try {
    const { username, email, password } : SignupRequest = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const connection = await getMongoConnection();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if(!emailRegex.test(email)) {
      return NextResponse.json({
        message: "Invalid email address",
      },{
        status: 400,
      })
    }

     if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      isVerified: false,
    });

    return NextResponse.json(
      { message: "User created", userId: newUser._id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Signup error:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
