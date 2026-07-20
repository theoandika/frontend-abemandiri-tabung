import { SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Fade, ListItemIcon, Menu, MenuItem, PopoverVirtualElement } from "@mui/material";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { cn } from "@/lib/utils";
import { ContentType } from "@/types/types";
import { useThemeContext } from "@/theme/theme-provider";
import NiChevronLeftRightReverseSmall from "@/icons/nexture/ni-chevron-left-right-reverse-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";

export default function UserContentSwitch() {
  const { content, setContent } = useThemeContext();
  const [anchorElMode, setAnchorElMode] = useState<EventTarget | Element | PopoverVirtualElement | null>(null);
  const openMode = Boolean(anchorElMode);
  const handleClickMode = (event: Event | SyntheticEvent) => {
    setAnchorElMode(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorElMode(null);
  };

  const getIcon = () => {
    if (content === ContentType.Boxed) {
      return <NiChevronLeftRightReverseSmall size={20} />;
    } else if (content === ContentType.Fluid) {
      return <NiChevronLeftRightSmall size={20} />;
    }
  };

  const { t } = useTranslation();

  return (
    <>
      <MenuItem onClick={handleClickMode} className={cn(openMode && "bg-grey-500/10")}>
        <ListItemIcon>{getIcon()}</ListItemIcon>
        <div className="w-full">{t("content")}</div>
        <Chip variant="outlined" label={t(`content-${content}`)} size="small" />
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
          className={cn(content === ContentType.Boxed && "active")}
          onClick={() => {
            handleClose();
            setContent(ContentType.Boxed)
          }}
        >
          <ListItemIcon>
            <NiChevronLeftRightReverseSmall size={20} />
          </ListItemIcon>
          {t(`content-${ContentType.Boxed}`)}
        </MenuItem>
        <MenuItem
          className={cn(content === ContentType.Fluid && "active")}
          onClick={() => {
            handleClose();
            setContent(ContentType.Fluid)
          }}
        >
          <ListItemIcon>
            <NiChevronLeftRightSmall size={20} />
          </ListItemIcon>
          {t(`content-${ContentType.Fluid}`)}
        </MenuItem>
      </Menu>
    </>
  );
}
