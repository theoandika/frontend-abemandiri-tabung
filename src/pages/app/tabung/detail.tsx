import { Box, Button, Dialog, DialogContent, DialogTitle, Grid, useMediaQuery, useTheme } from "@mui/material";
import NiCrossFull from "@/icons/nexture/ni-cross-full";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";

interface DataType {
  id: string,
  site: {
    id: string,
    name: string
  },
  number: string,
  barcode?: string,
  tube_content: {
    id: string,
    code: string,
    name: string
  },
  type: string,
  own: boolean,
  active: boolean,
  status: string,
  position: string,
  second_owner?: {
    id: string,
    code: string,
    name: string
  },
  photo?: string
};

interface DialogProps {
  openDialog: boolean,
  setOpenDialog: (open: boolean) => void
  data?: DataType
}

export default function DetailTube({ openDialog, setOpenDialog, data }: DialogProps) {
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
            Nomor Tabung :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.number}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Barcode :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.barcode}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Isi :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.tube_content.code} - {data?.tube_content.name}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Jenis :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.type == 'industry' ? 'Industri' : 'Medis'}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Tabung DM :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.own ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
          </Grid>
          {data?.second_owner != null && (
            <>
              <Grid size={{ xs: 6, md: 4}}>
                Pemilik :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.second_owner.code} - {data?.second_owner.name}
              </Grid>
            </>
          )}
          <Grid size={{ xs: 6, md: 4}}>
            Aktif :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.active ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Kondisi :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.status == 'empty' && 'Kosong'}
            {data?.status == 'filled' && 'Isi'}
            {data?.status == 'broken' && 'Rusak'}
            {data?.status == 'expired' && 'Afkir'}
            {data?.status == 'display' && 'Pajangan'}
            {data?.status == null && 'Tidak diketahui'}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Posisi Tabung :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.position == 'site' && 'Cabang'}
            {data?.position == 'member' && 'Member'}
            {data?.position == 'supplier' && 'Supplier'}
            {data?.position == 'transit' && 'Transit'}
            {data?.position == 'unknown' && 'Tidak diketahui'}
          </Grid>
          <Grid size={{ xs: 6, md: 4}}>
            Foto :
          </Grid>
          <Grid size={{ xs: 6, md: 8}}>
            {data?.photo != null ? (
              <img className="rounded-md w-40" src={data?.photo} />
            ) : 'Belum ada foto'}
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
