"use client"
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  // As soon as the user hits "localhost:3000", they go to "/dashboard"
  router.push("/login");
}
