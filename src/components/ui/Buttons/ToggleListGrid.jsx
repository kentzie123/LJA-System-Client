import { List, LayoutGrid } from "lucide-react";

const ToggleListGrid = ({ setView, view }) => {
  return (
    <button
      onClick={() => setView((prev) => (prev === "list" ? "grid" : "list"))}
      className="relative grid grid-cols-2 items-center h-10 w-20 rounded-lg bg-base-300 p-1 cursor-pointer shrink-0"
    >
      {/* Sliding Background */}
      {/* Logic: Width is roughly 50% minus padding. Translate moves it to the other side. */}
      <div
        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-md bg-base-200 shadow-sm transition-all duration-300 ease-out
        ${view === "list" ? "left-1" : "left-[50%]"}
      `}
      />

      {/* List Icon */}
      <div className="z-10 flex justify-center items-center">
        <List
          className={`size-5 transition-colors duration-300 ${
            view === "list" ? "text-primary" : "text-base-content/50"
          }`}
        />
      </div>

      {/* Grid Icon */}
      <div className="z-10 flex justify-center items-center">
        <LayoutGrid
          className={`size-5 transition-colors duration-300 ${
            view === "grid" ? "text-primary" : "text-base-content/50"
          }`}
        />
      </div>
    </button>
  );
};

export default ToggleListGrid;