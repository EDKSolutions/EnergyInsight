import darkLogo from "@/assets/logos/dark.svg";
import logo from "@/assets/logos/logo.png";
import Image from "next/image";

export function Logo() {
  return (
    <div className="relative h-14 w-14">
      <Image
        src={logo}
        fill
        className="dark:hidden"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />

      <Image
        src={darkLogo}
        fill
        className="hidden dark:block"
        alt="NextAdmin logo"
        role="presentation"
        quality={100}
      />
      <p className="text-2xl font-bold">EDK </p>
    </div>
  );
}
