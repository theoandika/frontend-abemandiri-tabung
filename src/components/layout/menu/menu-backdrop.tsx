import { useLayoutContext } from "@/components/layout/layout-context";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export default function MenuBackdrop() {
  const { resetLeftMenu, leftShowBackdrop, temporaryShowPrimaryMenu, setTemporaryShowPrimaryMenu } = useLayoutContext();

  const handleOnClick = () => {
    if (temporaryShowPrimaryMenu) {
      setTemporaryShowPrimaryMenu(false);
      resetLeftMenu();
    }
    if (leftShowBackdrop) {
      resetLeftMenu();
    }
  };

  useEffect(() => {
    resetLeftMenu();
  }, [])

  return (
    <>
      {(leftShowBackdrop || temporaryShowPrimaryMenu) && (
        <div className={cn("absolute inset-0 start-0 top-0 z-0")} onClick={() => handleOnClick()}></div>
      )}
    </>
  );
}
