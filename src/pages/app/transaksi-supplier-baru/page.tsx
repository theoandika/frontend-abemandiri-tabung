import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  Select,
  MenuItem,
  Typography,
  Grid,
  FormControlLabel,
  Autocomplete,
  TextField,
  RadioGroup,
  Radio,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useMediaQuery,
  Collapse,
  Alert,
  Chip,
  Tooltip,
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import { cn } from "@/lib/utils";
import { useZxing } from 'react-zxing';
import { useTheme } from '@mui/material/styles';
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import axios from "@/api/axios";

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCross from "@/icons/nexture/ni-cross";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiCamera from "@/icons/nexture/ni-camera";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { useNavigate } from "react-router-dom";

export default function Page() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [site, setSite] = useState("")
  const [siteOptions, setSiteOptions] = useState([])
  const [supplier, setSupplier] = useState<{ label: string; value: string } | null>(null)
  const [supplierOptions, setSupplierOptions] = useState<{ label: string; value: string }[]>([])
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [transactionType, setTransactionType] = useState("")
  const [tubeStatus, setTubeStatus] = useState("")
  const [isTubeStatusDisabled, setIsTubaStatusDisabled] = useState(false)
  const [note, setNote] = useState("")
  const [barcodes, setBarcodes] = useState<{id: string, value: string}[]>([])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [scanPaused, setScanPaused] = useState(true)
  const [scanResult, setScanResult] = useState<string>("")
  const [manualBarcode, setManualBarcode] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [errorBarcodes, setErrorBarcodes] = useState<{barcode: string, message: string}[]>([])

  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));

  const checkBarcodeExists = (barcode: string) => {
    return barcodes.findIndex(item => item.value === barcode) === -1 ? false : true
  }

  const { ref } = useZxing({
    deviceId: deviceId,
    onDecodeResult(result) {
      if (!checkBarcodeExists(result.rawValue)) {
        setBarcodes(prev => [...prev, { id: crypto.randomUUID().toString(), value: result.rawValue }])
        setScanResult(result.rawValue)
      } else {
        setScanResult("Barcode sudah ada")
      }
    },
    paused: scanPaused,
    timeBetweenDecodingAttempts: 3000
  });

  const getSiteOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SITE_ALL)
    .then((res) => {
      setSiteOptions(res?.data?.data)
      if (res?.data?.data?.length === 1) {
        setSite(res?.data?.data[0]?.id)
      }
    })
    .finally(() => {
      setIsLoading(false)
    })
  }
  const getSupplierOptions = () => {
    setSupplierOptions([])
    setIsLoading(true)
    axios.get(ApiEndpoint.SUPPLIER)
    .then((res) => {
      const options = res.data.data.map((member: any) => ({
        label: `${member.code} - ${member.name}`,
        value: member.id,
      }));

      setSupplierOptions(options);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = () => {
    setIsLoading(true)
    const data = new FormData();
    data.append('site', site);
    data.append('supplier', supplier?.value ?? "")
    data.append('date', date.format("YYYY-MM-DD hh:mm"))
    data.append('transaction_type', transactionType)
    data.append('tube_status', tubeStatus)
    data.append('note', note)
    barcodes.map((item) => {
      data.append('barcodes[]', item.value)
    })

    axios.post(ApiEndpoint.SUPPLIER_TRANSACTION, data)
    .then(() => {
      navigate('/transaksi-supplier')
    })
    .catch((err) => {
      let errData = err?.response?.data
      setErrors(errData?.errors);
      setErrorMessage(errData?.message);
      errData?.data && setErrorBarcodes(errData.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    getSiteOptions()
    getSupplierOptions()
  }, [])

  useEffect(() => {
    if (transactionType == 'refill') {
      setTubeStatus("empty")
      setIsTubaStatusDisabled(true)
    } else if (transactionType == 'filled') {
      setTubeStatus("filled")
      setIsTubaStatusDisabled(true)
    } else if (transactionType == 'fixing') {
      setTubeStatus("broken")
      setIsTubaStatusDisabled(true)
    } else {
      setTubeStatus("")
      setIsTubaStatusDisabled(false)
    }
  }, [transactionType])

  const deleteBarcode = (id: string) => {
    setBarcodes([...barcodes.filter((item) => item.id !== id)])
  }

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

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Transaksi Baru
          </Typography>
        </Grid>
      </Grid>

      <Grid size={12}>
        {errorMessage && (
          <Box>
            <Collapse in={true}>
              <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
                {errorMessage}
              </Alert>
            </Collapse>
          </Box>
        )}
        <Box>
          <Card>
            <CardContent>
              <Grid container columnSpacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl variant="standard" fullWidth className="outlined">
                    <FormLabel component="label">Tanggal *</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        disabled={isLoading}
                        value={date}
                        format="DD/MM/YYYY H:mm"
                        className="mb-0"
                        onChange={(value) => value !== null && setDate(value)}
                        slots={{
                          openPickerIcon: (props) => {
                            return <NiCalendar {...props} className={cn(props.className, "text-text-secondary")} />;
                          },
                          switchViewIcon: (props) => {
                            return <NiChevronDownSmall {...props} className={cn(props.className, "text-text-secondary")} />;
                          },
                          leftArrowIcon: (props) => {
                            return <NiChevronLeftSmall {...props} className={cn(props.className, "text-text-secondary")} />;
                          },
                          rightArrowIcon: (props) => {
                            return <NiChevronRightSmall {...props} className={cn(props.className, "text-text-secondary")} />;
                          },
                          clearIcon: (props) => {
                            return <NiCross {...props} className={cn(props.className, "text-text-secondary")} />;
                          },
                        }}
                        slotProps={{
                          textField: { size: "small", variant: "standard" },
                          desktopPaper: { className: "outlined" },
                        }}
                      />
                    </LocalizationProvider>
                    {errors != undefined && errors['date'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['date'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Cabang *</FormLabel>
                    <Select
                      value={site}
                      label="Cabang"
                      onChange={(e: any) => setSite(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      {siteOptions.map((item: any, idx: any) => (
                        <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                      ))}
                    </Select>
                    {errors != undefined && errors['site'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['site'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel component="label">Supplier *</FormLabel>
                    <Autocomplete
                      size="small"
                      popupIcon={<NiChevronDownSmall />}
                      clearIcon={<NiCross />}
                      value={supplier}
                      options={supplierOptions}
                      getOptionKey={(option) => option.value}
                      onChange={(_, val) => setSupplier(val ?? null)}
                      renderInput={(params) => (
                        <TextField {...params} variant="standard" className="outlined" placeholder="" />
                      )}
                      slotProps={{
                        popper: { className: "outlined" },
                        chip: {
                          variant: "filled",
                          size: "small",
                        },
                      }}
                      disabled={isLoading}
                    />
                    {errors != undefined && errors['supplier'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['supplier'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Isi Ulang/Perbaikan *</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={transactionType}
                      onChange={(e) => setTransactionType((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="refill"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Isi Ulang"
                        disabled={isLoading}
                      />
                      <FormControlLabel
                        value="filled"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Selesai Isi Ulang"
                        disabled={isLoading}
                      />
                      <FormControlLabel
                        value="fixing"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Perbaikan"
                        disabled={isLoading}
                      />
                      <FormControlLabel
                        value="fixed"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Selesai Perbaikan"
                        disabled={isLoading}
                      />
                    </RadioGroup>
                    {errors != undefined && errors['transaction_type'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['transaction_type'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Kondisi Tabung *</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={tubeStatus}
                      onChange={(e) => setTubeStatus((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="filled"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Isi"
                        disabled={isLoading || isTubeStatusDisabled}
                      />
                      <FormControlLabel
                        value="empty"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Kosong"
                        disabled={isLoading || isTubeStatusDisabled}
                      />
                      <FormControlLabel
                        value="broken"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Rusak"
                        disabled={isLoading || isTubeStatusDisabled}
                      />
                    </RadioGroup>
                    {errors != undefined && errors['tube_status'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['tube_status'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Catatan</FormLabel>
                    <Input value={note} placeholder="" onChange={(e: any) => setNote(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['note'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['note'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
              </Grid>

              <Box className="flex flex-col border border-grey-100 p-4 rounded-md my-4">
                <Box>
                  <Box className="flex justify-between items-center">
                    <Typography variant="h5">Hasil Scan</Typography>
                    <Box className="flex items-center gap-1">
                      <FormControl className="outlined mb-0" variant="standard" size="small">
                        <Input
                          value={manualBarcode}
                          placeholder="Barcode"
                          onChange={(e) => setManualBarcode(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              if (manualBarcode != "" && manualBarcode != undefined) {
                                if (!checkBarcodeExists(manualBarcode)) {
                                  setBarcodes(prev => [...prev, { id: crypto.randomUUID().toString(), value: manualBarcode }])
                                }
                                setManualBarcode("")
                              }
                            }
                          }}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <Button
                        className="icon-only"
                        size="large"
                        color="primary"
                        variant="contained"
                        onClick={() => setScanPaused(!scanPaused)}
                        startIcon={<NiCamera size={"large"} />}
                        disabled={isLoading}
                      />
                    </Box>
                  </Box>
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
                      <Button onClick={() => setScanPaused(true)}>Tutup</Button>
                    </DialogActions>
                  </Dialog>
                </Box>
                {barcodes.length > 0 && (
                  <Grid container spacing={2} className="mt-2">
                    {barcodes.map(item => {
                      let errExists = errorBarcodes.find(i => i.barcode == item.value)
                      return (
                        errExists ? (
                          <Tooltip title={errExists.message}>
                            <Chip key={item.id} variant="outlined" color="error" label={item.value} disabled={isLoading} onDelete={() => deleteBarcode(item.id)} />
                          </Tooltip>
                        ) : (
                          <Chip key={item.id} variant="outlined" label={item.value} disabled={isLoading} onDelete={() => deleteBarcode(item.id)} />
                        )
                      )
                    })}
                  </Grid>
                )}
              {errors != undefined && errors['barcodes'] && <FormLabel component="label" className="text-error! text-sm!">{errors['barcodes'][0]}</FormLabel>}
              </Box>
              <Box className="w-full flex justify-end">
                <Button
                  size="large"
                  startIcon={<NiFloppyDisk />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="pastel"
                  color="primary"
                  onClick={() => save()}
                >Simpan</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
}