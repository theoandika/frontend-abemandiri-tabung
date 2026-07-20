import { SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { Chip, Fade, ListItemIcon, Menu, MenuItem, PopoverVirtualElement } from "@mui/material";

import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { cn } from "@/lib/utils";
import { useLayoutContext } from "../layout-context";
import { MenuType } from "@/types/types";
import NiMenu from "@/icons/nexture/ni-menu";
import NiMenuSplit from "@/icons/nexture/ni-menu-split";
import NiMenuSplitDot from "@/icons/nexture/ni-menu-split-dot";

export default function UserLeftMenuSwitch() {
  const { leftMenuType, setLeftMenuType } = useLayoutContext();
  const [anchorElMode, setAnchorElMode] = useState<EventTarget | Element | PopoverVirtualElement | null>(null);
  const openMode = Boolean(anchorElMode);
  const handleClickMode = (event: Event | SyntheticEvent) => {
    setAnchorElMode(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElMode(null);
  };

  const getModeIcon = () => {
    if (leftMenuType === MenuType.Minimal) {
      return <NiMenuSplitDot size={20} />;
    } else if (leftMenuType === MenuType.Comfort) {
      return <NiMenuSplit size={20} />;
    } else {
      return <NiMenu size={20} />;
    }
  };

  const { t } = useTranslation();

  return (
    <>
      <MenuItem onClick={handleClickMode} className={cn(openMode && "bg-grey-500/10")}>
        <ListItemIcon>{getModeIcon()}</ListItemIcon>
        <div className="w-full">{t("left-menu")}</div>
        <Chip variant="outlined" label={t(`menu-${leftMenuType}`)} size="small" />
        <ListItemIcon>
          <NiChevronRightSmall
            size={20}
            className={cn("ms-1 me-0 transition-transform rtl:rotate-180", openMode && "rotate-90 rtl:rotate-90")}
          />
        </ListItemIcon>
      </MenuItem>
      <Menu
        anchorEl={anchorElMode as Element}
        disableScrollLock
        open={openMode}
        onClose={handleClose}
        classes={{ paper: "mt-1 w-72" }}
        slots={{
          transition: Fade,
        }}
      >
        <MenuItem
          className={cn(leftMenuType === MenuType.Minimal && "active")}
          onClick={() => {
            handleClose();
            setLeftMenuType(MenuType.Minimal)
          }}
        >
          <ListItemIcon>
            <NiMenuSplitDot size={20} />
          </ListItemIcon>
          {t(`menu-${MenuType.Minimal}`)}
        </MenuItem>
        <MenuItem
          className={cn(leftMenuType === MenuType.Comfort && "active")}
          onClick={() => {
            handleClose();
            setLeftMenuType(MenuType.Comfort)
          }}
        >
          <ListItemIcon>
            <NiMenuSplit size={20} />
          </ListItemIcon>
          {t(`menu-${MenuType.Comfort}`)}
        </MenuItem>
        <MenuItem
          className={cn(leftMenuType === MenuType.SingleLayer && "active")}
          onClick={() => {
            handleClose();
            setLeftMenuType(MenuType.SingleLayer)
          }}
        >
          <ListItemIcon>
            <NiMenu size={20} />
          </ListItemIcon>
          {t(`menu-${MenuType.SingleLayer}`)}
        </MenuItem>
      </Menu>
    </>
  );
}
