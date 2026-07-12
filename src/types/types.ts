import { ButtonProps } from "@mui/material";

import { IconName } from "@/icons/nexture-icons";

export type Screens = {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
};

export enum Viewer {
  ADMINISTRATOR = 0,
  STANDARD = 1
}

export type MenuItem = {
  id: string;
  label: string;
  description?: string;
  listIcon?: IconName;
  icon?: IconName;
  href?: string;
  color?: ButtonProps["color"];
  children?: MenuItem[];
  canAccess?: Viewer[];
  isExternalLink?: boolean;
  content?: React.ReactNode;
  hideInMenu?: boolean;
  permission?: string
};

export enum ContentType {
  Boxed = "boxed",
  Fluid = "fluid",
}

export enum MenuType {
  Minimal = "minimal",
  Comfort = "comfort",
  SingleLayer = "single-layer",
}

export enum MenuShowState {
  Show = "SHOW",
  Hide = "HIDE",
  TemporaryShow = "TEMPORARY_SHOW",
}

export type MenuWidth = { primary: number; secondary: number };
export type MenuDefaultWidth = {
  [MenuType.Minimal]: MenuWidth;
  [MenuType.Comfort]: MenuWidth;
  [MenuType.SingleLayer]: MenuWidth;
};

export type User = {
  email: string,
  name: string,
  level: Viewer,
  role?: Role
}

export type Role = {
  id: string,
  name: string,
  permissions?: Permission[]
}

export type Permission = {
  name: string,
  key: string
}
