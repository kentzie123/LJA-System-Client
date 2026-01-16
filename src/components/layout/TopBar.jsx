// Theme toggler
import ThemeToggle from "./ThemeToggle";

// Image Optimizer
import Image from "next/image";

const TopBar = () => {
  return (
    <div className="flex justify-end mb-6">
      <div className="flex items-center gap-4">
        <ThemeToggle />

        <div className="flex gap-4 border-l-[0.5px] ps-4 border-base-content/50">
          <div>
            <div className="text-xs font-semibold">Kent Adriane Goc-ong</div>
            <div className="text-xxs tracking-wider opacity-65">
              Website Manager
            </div>
          </div>
          <div className="size-8 shrink-0 relative border border-base-300 rounded-full">
            <Image
              src="/images/lja-logo.webp"
              alt="LJA Logo"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
