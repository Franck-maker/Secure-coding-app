import { redirect } from "next/navigation";

export default function Home() {
  // As soon as the user hits "localhost:3000", they go to "/dashboard"
  redirect("/dashboard");
}
