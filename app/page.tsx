import { redirect } from 'next/navigation';

export default function Home() {
  // As soon as the user hits the root, redirect them to the login page.
  redirect('/login');
}
