import { List, LayoutGrid } from "lucide-react";

const ToggleListGrid = ({ setView, view }) => {
  return (
    <button
      onClick={() => setView((prev) => (prev === "list" ? "grid" : "list"))}
      className="relative grid grid-cols-2 items-center gap-2 rounded-lg bg-base-300 px-2 cursor-pointer"
    >
      {/* sliding background */}
      <div
        className={`absolute top-1 bottom-1 w-[44%] rounded-md bg-base-content/20 transition-all duration-200
      ${view === "list" ? "left-1" : "left-1/2"}
    `}
      />

      {/* icons */}
      <List
        className={`size-5 z-10 transition-colors duration-300 ${
          view === "list" ? "text-primary" : "opacity-60"
        }`}
      />
      <LayoutGrid
        className={`size-5 z-10 transition-colors duration-300 ${
          view === "grid" ? "text-primary" : "opacity-60"
        }`}
      />
    </button>
  );
};

export default ToggleListGrid;
