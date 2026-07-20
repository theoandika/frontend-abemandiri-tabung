import { useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import { CheckboxSmallChecked, CheckboxSmallEmptyOutlined } from "@/icons/form/mui-checkbox";
import NiCamera from "@/icons/nexture/ni-camera";
import { useZxing } from "react-zxing";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiDocumentImage from "@/icons/nexture/ni-document-image";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import Loading from "@/pages/loading";

interface Row {
  id: string
  number: string
  barcode?: string
  tube_content: {
    id: string,
    code: string
    name: string
  },
  type: string,
  tube_barcodes: {
    id: string
    barcode: string,
    photo: string
  }[]
  site: {
    id: string
    name: string
  },
};

interface RowSave {
  tube_id: string
  barcode: string
  photo: File | null
  isSave: boolean
}

export default function Page() {
  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));
  const [loading, setLoading] = useState<boolean>(false)
  const [rows, setRows] = useState<Row[]>([]);
  const [filteredRows, setFilteredRows] = useState<Row[]>([])
  const [search, setSearch] = useState<string>("")
  const navigate = useNavigate()
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [scanPaused, setScanPaused] = useState<boolean>(true)
  const [rowsSave, setRowsSave] = useState<RowSave[]>([])
  const [activeScanId, setActiveScanId] = useState<string>("")
  const [scanResult, setScanResult] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")

  const { ref } = useZxing({
    deviceId: deviceId,
    onDecodeResult(result) {
      setScanResult(result.rawValue)
      let dataToSave = rowsSave.findIndex(el => el.tube_id == activeScanId)
      let old = [...rowsSave]
      let change = {...old[dataToSave]}
      change.barcode = result.rawValue
      old[dataToSave] = change
      setRowsSave(old)
    },
    paused: scanPaused,
    timeBetweenDecodingAttempts: 3000
  });

  useEffect(() => {
    setFilteredRows(rows.filter(item => item.number.toLowerCase().includes(search)))
  }, [search])
  
  useEffect(() => {
      if(!scanPaused) {
        navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        .then(() => {
          navigator.mediaDevices.enumerateDevices()
          .then((availableDevices) => {          
            const availableVideoDevices = availableDevices.filter(device => device.kind === 'videoinput');
            if (availableVideoDevices.length === 0) {
              console.log('no camera found');
            } else if (availableVideoDevices.length === 1) {
              setDevices(availableVideoDevices);
              setDeviceId(availableVideoDevices[0].deviceId)
            } else {
              setDevices(availableVideoDevices);
              setDeviceId(availableVideoDevices[0].deviceId)
            }
          })
        })
      }
    }, [scanPaused]);

  const getRows = () => {
    setLoading(true)
    axios.post(ApiEndpoint.TUBE_BARCODES_INDEX)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
      setFilteredRows(result)
      setRowsSave([...result.map(el => ({ tube_id: el.id, barcode: "", photo: null, isSave: false }))])
    })
    .finally(() => setLoading(false))
  }

  useEffect(() => {
    getRows()
  }, [])

  const save = () => {
    setLoading(true)
    let data = new FormData()
    rowsSave.filter(el => el.isSave).forEach((el, idx) => {
      data.append(`tube_barcodes[${idx}][tube_id]`, el.tube_id)
      data.append(`tube_barcodes[${idx}][barcode]`, el.barcode)
      data.append(`tube_barcodes[${idx}][photo]`, el.photo ?? "")
    })    
    axios.post(ApiEndpoint.TUBE_BARCODES_UPDATE, data)
    .then(_ => {
      navigate('/tabung')
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrors(errData?.errors);
      setErrorMessage(errData?.message);
    })
    .finally(() => {
      setLoading(false)
    })
  }

  return (
    <Box>
      <Box className="min-h-auto border-none w-full">
        <Grid container spacing={5} className="mb-4 w-full">
          <Grid container spacing={2.5} className="w-full" size={12}>
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Ubah Barcode
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
              <Tooltip title="Simpan">
                <Button
                  loading={loading}
                  loadingPosition="start"
                  className="surface-standard"
                  size="medium"
                  color="primary"
                  variant="surface"
                  startIcon={<NiFloppyDisk size={"medium"} />}
                  onClick={() => save()}
                  disabled={rowsSave.filter(el => el.isSave).length < 1}
                >Simpan</Button>
              </Tooltip>
            </Grid>
          </Grid>

          <Grid container spacing={5} className="w-full" size={12}>
            <FormControl variant="outlined" size="medium" className="surface mb-0 flex-1">
              <FormLabel>Cari</FormLabel>
              <TextField variant="outlined" placeholder="" value={search} onChange={(e) => setSearch(e.target.value)} />
            </FormControl>
          </Grid>
          {errorMessage && (
            <Grid size={12}>
              <Box>
                <Collapse in={true}>
                  <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
                    {errorMessage}
                  </Alert>
                </Collapse>
              </Box>
            </Grid>
          )}
        </Grid>
      </Box>
      {loading ? (
        <Loading />
      ) : (
        <Box className="flex flex-col gap-2">
          {filteredRows.map((item, idx) => (
            <Card>
              <CardContent>
                <Box className="flex justify-between">
                  <Typography variant="h6" component="h6" className="card-title">
                    Nomor Tabung : {item.number}
                  </Typography>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={rowsSave.filter(el => el.tube_id == item.id)[0]?.isSave ?? false}
                          icon={<CheckboxSmallEmptyOutlined />}
                          checkedIcon={<CheckboxSmallChecked />}
                          size="small"
                          slotProps={{
                            input: { 'aria-label': 'controlled' },
                          }}
                          onChange={(e) => {
                            let dataToSave = rowsSave.findIndex(el => el.tube_id == item.id)
                            let old = [...rowsSave]
                            let change = {...old[dataToSave]}
                            change.isSave = e.target.checked
                            old[dataToSave] = change
                            setRowsSave(old)
                          }}
                          disabled={loading}
                        />
                      }
                      label="Simpan"
                    />
                  </FormControl>
                </Box>
                {errors != undefined && (errors[`tube_barcodes.${idx}.photo`] != undefined || errors[`tube_barcodes.${idx}.barcode`] != undefined) && (
                  <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
                    {errors[`tube_barcodes.${idx}.barcode`]}
                    {errors[`tube_barcodes.${idx}.photo`]}
                  </Alert>
                )}
                <Grid container size={12} spacing={5}>
                  <Grid className="flex flex-col items-center border border-grey-100 rounded-md p-2 gap-2" size={{ xs: 6, md: 4, lg: 3, xl: 2 }}>
                    <Box className="flex flex-row items-center gap-1 w-full">
                      <TextField
                        value={rowsSave.filter(el => el.tube_id == item.id)[0]?.barcode}
                        variant="standard"
                        size="small"
                        placeholder="Barcode"
                        fullWidth
                        className="mb-0 flex-1"
                        onChange={(e) => {
                          let dataToSave = rowsSave.findIndex(el => el.tube_id == item.id)
                          let old = [...rowsSave]
                          let change = {...old[dataToSave]}
                          change.barcode = e.target.value
                          old[dataToSave] = change
                          setRowsSave(old)
                        }}
                        disabled={loading}
                      />
                      <Button
                        className="icon-only"
                        size="medium"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          setActiveScanId(item.id)
                          setScanPaused(!scanPaused)
                        }}
                        startIcon={<NiCamera size={"medium"} />}
                        disabled={loading}
                      />
                    </Box>
                    <Box className="flex-1 flex items-center justify-center w-full">
                      <img className="rounded-md" alt="Preview" src={rowsSave.filter(el => el.tube_id == item.id)[0].photo != null ? URL.createObjectURL(rowsSave.filter(el => el.tube_id == item.id)[0].photo!) : null!}  />
                    </Box>
                    <Box className="flex gap-1">
                      <input
                        id={`file-input-${item.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          let dataToSave = rowsSave.findIndex(el => el.tube_id == item.id)
                          let old = [...rowsSave]
                          let change = {...old[dataToSave]}
                          change.photo = e.target.files != null ? e.target.files[0] : null
                          old[dataToSave] = change
                          setRowsSave(old)
                        }}
                        disabled={loading}
                      />
                      <Button
                        className="icon-only"
                        size="medium"
                        color="primary"
                        variant="contained"
                        onClick={() => {
                          document.getElementById(`file-input-${item.id}`)?.click()
                        }}
                        startIcon={<NiDocumentImage size={"medium"} />}
                        disabled={loading}
                      />
                      {rowsSave.filter(el => el.tube_id == item.id)[0].photo != null && (
                        <Button
                          className="icon-only"
                          size="medium"
                          color="error"
                          variant="contained"
                          onClick={() => {
                            let dataToSave = rowsSave.findIndex(el => el.tube_id == item.id)
                            let old = [...rowsSave]
                            let change = {...old[dataToSave]}
                            change.photo = null
                            old[dataToSave] = change
                            setRowsSave(old)
                          }}
                          startIcon={<NiCrossSquare size={"medium"} />}
                          disabled={loading}
                        />
                      )}
                    </Box>
                  </Grid>
                  {item.tube_barcodes.map((item2, _) => (
                    <Grid className="flex flex-col items-center border border-grey-100 rounded-md p-2 gap-2" size={{ xs: 6, md: 4, lg: 3, xl: 2 }}>
                      <Typography>
                        {item2.barcode}
                      </Typography>
                      <Box className="flex-1 flex items-center">
                        <img className="rounded-md" src={item2.photo} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      <Dialog fullScreen={fullScreenResponsive} open={!scanPaused} onClose={() => setScanPaused(true)}>
        <DialogTitle>Scan Barcode</DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4 text-justify">
            Pilih kamera dengan kualitas terbaik agar proses scan lebih cepat
          </DialogContentText>
          <Box className="w-full flex flex-col gap-2">
            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
              <Select
                value={deviceId}
                label="Kamera"
                onChange={(e: any) => setDeviceId(e.target.value)}
                IconComponent={NiChevronDownSmall}
                MenuProps={{ className: "outlined" }}
              >
                {devices.map((item, idx: any) => (
                  <MenuItem key={idx} value={item.deviceId}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <video className="w-full" ref={ref} />
            <DialogContentText className="mt-2 text-center text-success">
              {scanResult}
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setScanPaused(true)
            setScanResult("")
          }}>Tutup</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}