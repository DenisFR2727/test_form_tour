import { createPortal } from "react-dom";
import { DropdownProps } from "./types";
import type { Country, GeoEntity } from "../../api/api";

interface DropdownListProps {
  loading: boolean;
  results: GeoEntity[];
  handleSelect: (item: GeoEntity) => void;
}
import "../form/form.scss";

export default function DropdownList({
  loading,
  results,
  handleSelect,
}: DropdownListProps) {
  return (
    <DropdownPortal>
      <ul className="dropdown">
        {loading && <li className="loading">Завантаження...</li>}
        {!loading &&
          results.map((item) => (
            <li key={item.id} onClick={() => handleSelect(item)}>
              {item.type === "country" && (
                <img
                  src={(item as Country).flag}
                  alt={item.name}
                  width={24}
                  height={16}
                />
              )}
              <span>
                {item.name}
                {item.type === "city" && <span>🏙️</span>}
                {item.type === "hotel" && <span>🏨</span>}
              </span>
            </li>
          ))}
      </ul>
    </DropdownPortal>
  );
}

function DropdownPortal({ children }: DropdownProps) {
  const overlay = document.getElementById("overlay-dropdown");

  if (!overlay) return null;

  return createPortal(<div>{children}</div>, overlay);
}
