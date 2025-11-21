import React from "react";
import { useNavLinkActive } from "./useNavLinkActive";

export interface NavLinkProps {
  url?: string;
  activeIncludes?: string[];
  render: (props: { active: boolean }) => React.ReactElement;
}

export function NavLink({ url, activeIncludes, render }: NavLinkProps) {
  const active = useNavLinkActive(url, activeIncludes);

  return render({ active });
}
