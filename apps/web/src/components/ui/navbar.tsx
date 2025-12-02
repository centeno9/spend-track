import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./button";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-5 py-4 border-b">
      <Link className="text-3xl font-black" href={"/"}>Spend-track</Link>
      <div className="flex items-center gap-3">
        <Link href={"/login"}>
          <Button variant={"ghost"}>Log in</Button>
        </Link>
        <Link href={"/signup"}>
          <Button>Sign up</Button>
        </Link>
        <ModeToggle />
      </div>
    </nav>
  );
};

export default Navbar;
