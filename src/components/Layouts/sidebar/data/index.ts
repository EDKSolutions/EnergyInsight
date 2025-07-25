import * as Icons from "@/components/Layouts/sidebar/icons";

export interface NavSubItem {
  title: string;
  url: string;
  isPro?: boolean;
  badge?: string;
}

export interface NavItem {
  title: string;
  icon: React.ComponentType;
  url?: string;
  items: NavSubItem[];
  isPro?: boolean;
  badge?: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const NAV_DATA: NavSection[] = [
  {
    label: "MAIN MENU",
    items: [
      {
        title: "Search Address",
        icon: Icons.HomeIcon,
        url: "/panel/search",
        items: [],
      },
      {
        title: "Calculations",
        url: "/panel/calculations",
        icon: Icons.Calendar,
        items: [],
      },
    ],
  }
];
