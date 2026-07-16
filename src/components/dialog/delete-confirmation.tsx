import { Dispatch, SetStateAction } from "react";

import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";

interface params {
  open: boolean,
  setOpen: Dispatch<SetStateAction<boolean>>
  onConfirm: () => void,
}

export default function DeleteConfirmation({ open, setOpen, onConfirm }: params) {
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
        <DialogTitle>Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah yakin ingin menghapus?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Tidak</Button>
          <Button variant="pastel" onClick={confirm} autoFocus>
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}