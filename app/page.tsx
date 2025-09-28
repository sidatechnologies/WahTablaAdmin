import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <section className="w-full h-screen flex flex-col justify-center items-center mx-auto">
      <div className="flex flex-col p-20 justify-center items-center gap-8">
        <h1 className="text-2xl font-bold">Welcome to Dhwani Admin Dashboard.</h1>
        <p>Please signup or login to continue furthur</p>

        <div className="flex justify-center items-center gap-8">
          <Link href="/signup">
            <Button variant="secondary">Signup</Button>
          </Link>
          <Link href="/login">
            <Button variant="default">Login</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
