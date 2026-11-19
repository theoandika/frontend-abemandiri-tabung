import { Alert, Box, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, FormControl, FormLabel, Grid, Input, Typography, useMediaQuery, useTheme } from "@mui/material";
import NiCrossFull from "@/icons/nexture/ni-cross-full";
import axios from "@/api/axios";
import ApiEndpoint from "@/api/api-endpoint";
import { useEffect, useState } from "react";
import NiDocumentImage from "@/icons/nexture/ni-document-image";
import ScannerDialog from "@/components/dialog/scanner-dialog";
import NiCamera from "@/icons/nexture/ni-camera";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";

interface DataType {
  id: string
  barcodes: {
    id: string
    barcode: string
    photo: string
  }[]
};

interface DialogProps {
  openDialog: boolean,
  setOpenDialog: (open: boolean) => void
  propsData?: DataType
  setIsNeedReloadData: (open: boolean) => void
}

export default function BarcodeHistory({ openDialog, setOpenDialog, propsData, setIsNeedReloadData }: DialogProps) {
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));
  const [data, setData] = useState<DataType>()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [barcode, setBarcode] = useState<string>("")
  const [photo, setPhoto] = useState<File>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingForm, setIsLoadingForm] = useState<boolean>(false)
  const [scanPaused, setScanPaused] = useState(true)
  const [result, setResult] = useState<string>("")

  useEffect(() => {
    if (propsData) {
      setData(propsData)
      setBarcode("")
      setPhoto(undefined)
      setErrorMessage("")
    }
  }, [propsData])

  useEffect(() => {
    if (result) {
      setBarcode(result)
    }
  }, [result])

  const getBarcodeHistory = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.TUBE_BARCODES + "/" + propsData?.id + "/barcode-history")
    .then((res) => {
      let result: DataType = res.data?.data
      setData(result)
    })
    .finally(() => {
      setIsLoading(false)
      setIsNeedReloadData(true)
    })
  }

  const save = () => {
    setIsLoadingForm(true)
    const formData = new FormData()
    formData.append("barcode", barcode)
    formData.append("photo", photo ?? "")
    axios.post(ApiEndpoint.TUBE_BARCODES + "/" + propsData?.id + "/update", formData)
    .then((res) => {
      let result: DataType = res.data?.data
      setData(result)
      getBarcodeHistory()
      setBarcode("")
      setPhoto(undefined)
      setErrorMessage("")
    })
    .catch((err) => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message);
    })
    .finally(() => setIsLoadingForm(false))
  }

  return (
    <Dialog fullWidth maxWidth="md" onClose={handleCloseDialog} open={openDialog} fullScreen={fullScreenResponsive}>
      <DialogTitle>
        <Box className="flex flex-row justify-between">
          <Box>Riwayat Barcode</Box>
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
        {!scanPaused && (
          <ScannerDialog allowMultiple={true} scanPaused={scanPaused} setScanPaused={setScanPaused} setScanResult={setResult} />
        )}
        {isLoading && (
          <Box className="flex flex-row items-center justify-center h-25 w-full">
            <CircularProgress color="primary" size={32} />
          </Box>
        )}
        <Grid container spacing={2}>
          {data?.barcodes.map((item2, _) => (
            <Grid className="flex flex-col items-center border border-grey-100 rounded-md p-2 gap-2" size={{ xs: 6, md: 4, lg: 3 }} key={item2.id}>
              <Typography>
                {item2.barcode}
              </Typography>
              <Box className="flex-1 flex items-center">
                <img className="rounded-md" src={item2.photo} />
              </Box>
            </Grid>
          ))}
          {data?.barcodes.length === 0 && (
            <Grid size={{ xs: 12 }} className="flex justify-center items-center p-2">
              <Typography color="text.secondary">
                Belum ada barcode.
              </Typography>
            </Grid>
          )}
        </Grid>
        <Divider className="my-4" />
        {errorMessage && (
          <Box>
            <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
              {errorMessage}
            </Alert>
          </Box>
        )}
        <Box className="flex justify-between items-center">
          <Typography variant="h6">Ubah Barcode</Typography>
          <Button
            className=""
            size="small"
            startIcon={<NiFloppyDisk size={"medium"} />}
            loading={isLoadingForm}
            loadingPosition="start"
            variant="pastel"
            color="primary"
            onClick={() => save()}
          >Simpan</Button>
        </Box>
        <Box className="flex gap-2 mt-2">
          <FormControl className="outlined flex-1 mb-0!" variant="standard" size="small">
            <FormLabel component="label">Barcode</FormLabel>
            <Input placeholder="" value={barcode} onChange={e => setBarcode(e.target.value)} disabled={isLoadingForm} />
          </FormControl>
          <Button
            className="icon-only self-end"
            size="small"
            color="primary"
            variant="contained"
            onClick={() => setScanPaused(!scanPaused)}
            startIcon={<NiCamera size={"medium"} />}
            disabled={isLoadingForm}
          />
          <Box className="flex gap-2 flex-1">
            <input
              id="file-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setPhoto(e.target.files ? e.target.files[0] : undefined)}
              disabled={isLoadingForm}
            />
            <Button
              className="self-end flex-1"
              size="small"
              color="primary"
              variant="contained"
              onClick={() => {
                document.getElementById(`file-input`)?.click()
              }}
              startIcon={<NiDocumentImage size={"medium"} />}
              disabled={isLoadingForm}
            >
              Unggah Foto
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
