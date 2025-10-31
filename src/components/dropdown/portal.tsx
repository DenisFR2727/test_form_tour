import { createPortal } from "react-dom";

interface DropdownProps {
  children: React.ReactNode;
}

export default function DropdownPortal({ children }: DropdownProps) {
  const overlay = document.getElementById("overlay-dropdown");

  if (!overlay) return null;

  return createPortal(<div>{children}</div>, overlay);
}
