import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, Typography, useMediaQuery, useTheme } from "@mui/material";
import NiCrossFull from "@/icons/nexture/ni-cross-full";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiCheckSquare from "@/icons/nexture/ni-check-square";

interface DataType {
  id: string,
  name: string,
  email: string,
  role: {
    id: string
    name: string
    permissions: {
      name: string
      key: string
    }[]
  } | null
  sites: {
    id: string
    name: string
  }[]
  is_active: boolean
};

interface DialogProps {
  openDialog: boolean,
  setOpenDialog: (open: boolean) => void
  data?: DataType
}

export default function DetailUser({ openDialog, setOpenDialog, data }: DialogProps) {
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Dialog onClose={handleCloseDialog} open={openDialog} fullScreen={fullScreenResponsive}>
      <DialogTitle>
        <Box className="flex flex-row justify-between">
          <Box>Detail User</Box>
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
            Email :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.email}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Role :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.role?.name}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Aktif :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.is_active ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
          </Grid>
          <Grid size={12} className="mt-2">
            <Typography variant="h6">Akses Cabang</Typography>
          </Grid>
          <Grid size={12} container>
            {data?.sites.map(item => (
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
