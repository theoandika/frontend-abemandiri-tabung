import { Dispatch, SetStateAction } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface params {
  title: string,
  message: string,
  cancelButton?: string,
  yesButton?: string,
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
  onConfirm: () => void,
}

export default function DialogYesNo({ open, setOpen, onConfirm, title, message, cancelButton = "Batal", yesButton = "Ya" }: params) {
  const close = () => {
    setOpen(false)
  }
  const confirm = () => {
    setOpen(false)
    onConfirm()
  }
  return (
    <Box>
      <Dialog open={open} onClose={close}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {message}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>{cancelButton}</Button>
          <Button variant="pastel" onClick={confirm} autoFocus>
            {yesButton}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}