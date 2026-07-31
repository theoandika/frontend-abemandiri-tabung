import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import NiCrossFull from "@/icons/nexture/ni-cross-full";

interface DataType {
  id: string,
  name: string,
  users_count: number,
  permissions: {
    name: string
    key: string
  }[]
};

interface DialogProps {
  openDialog: boolean,
  setOpenDialog: (open: boolean) => void
  data?: DataType
}

export default function DetailRole({ openDialog, setOpenDialog, data }: DialogProps) {
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog onClose={handleCloseDialog} open={openDialog} fullScreen={fullScreenResponsive}>
      <DialogTitle>
        <Box className="flex flex-row justify-between">
          <Box>Detail Tabung</Box>
          <Box className="flex flex-row">
            <Button
              className="icon-only"
              onClick={handleCloseDialog}
              size="small"
              color="grey"
              startIcon={<NiCrossFull size="small" />}
            />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent className="pb-10">
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, md: 4}}>
            Nama :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.name}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Jumlah User :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.users_count}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Jumlah Hak Akses :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.permissions.length}
          </Grid>
          <Grid size={12} className="mt-2">
            <Typography variant="h6">Hak Akses</Typography>
          </Grid>
          <Grid size={12} container>
            {data?.permissions.map(item => (
              <Grid key={crypto.randomUUID()} size={{ sm: 6, xs: 12 }} className="px-2 py-1 rounded-md bg-text-muted">
                {item.name}
              </Grid>
            ))}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
