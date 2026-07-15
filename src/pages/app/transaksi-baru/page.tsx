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
} from "@mui/material";
import Axios from "@/api/axios"
import ApiEndpoint from "@/api/api-endpoint"
import { cn } from "@/lib/utils";
import { useZxing } from 'react-zxing';

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { styled, useTheme } from '@mui/material/styles';
import NiCross from "@/icons/nexture/ni-cross";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiCamera from "@/icons/nexture/ni-camera";
import axios from "@/api/axios";
import { useDropzone } from "react-dropzone";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [site, setSite] = useState("")
  const [siteOptions, setSiteOptions] = useState([])
  const [member, setMember] = useState<{ label: string; value: string } | null>(null)
  const [memberOptions, setMemberOptions] = useState<{ label: string; value: string }[]>([])
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [transactionType, setTransactionType] = useState("")
  const [tubeStatus, setTubeStatus] = useState("")
  const [note, setNote] = useState("")
  const [nominal, setNominal] = useState("")
  const [document, setDocument] = useState<(any & { preview: string }[])>([]);
  const [barcodes, setBarcodes] = useState<{id: string, value: string}[]>([])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState<string>("");
  const [scanPaused, setScanPaused] = useState(true)
  const [scanResult, setScanResult] = useState<string>("")
  const [manualBarcode, setManualBarcode] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>()

  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/jpg": [],
      "image/png": [],
      "image/jpeg": [],
      "application/pdf": [],
    },
    onDrop: (acceptedFiles) => {
      const newFiles: any[] = [];
      acceptedFiles.map((file) => {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        newFiles.push(newFile);
      });
      setDocument(newFiles);
    },
  });

  const handleRemoveImage = () => {
    setDocument([]);
  };

  const thumbs = document.map((file: any) => (
    <Box
      key={file.name}
      className="bg-grey-25 flex-non flex w-full cursor-default flex-row items-start rounded-sm p-1"
      onClick={(event) => {
        event.stopPropagation();
      }}
    >
      <img
        alt={file.name}
        src={file.preview}
        className="h-12 w-16 rounded-xs object-cover"
        onLoad={() => {
          URL.revokeObjectURL(file.preview);
        }}
      />
      <Box className="flex flex-1 flex-row items-center justify-between gap-1 px-3 py-2">
        <Box className="flex flex-col">
          <Typography variant="body1" component="p" className="line-clamp-1 leading-3.5">
            {file.name}
          </Typography>
          <Typography variant="body2" component="p" className="text-text-secondary">
            {Math.round(file.size / 1000)} KB
          </Typography>
        </Box>
        <Button
          onClick={(event) => {
            event.stopPropagation();
            handleRemoveImage();
          }}
          className="icon-only hover:text-primary! flex-none"
          size="tiny"
          color="grey"
          variant="pastel"
          startIcon={<NiBinEmpty size={"tiny"} />}
        />
      </Box>
    </Box>
  ));

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
    Axios.get(ApiEndpoint.SITE_ALL)
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
  const getMemberOptions = () => {
    setMemberOptions([])
    setIsLoading(true)
    Axios.get(ApiEndpoint.MEMBER_ALL)
    .then((res) => {
      const options = res.data.data.map((member: any) => ({
        label: `${member.code} - ${member.name}`,
        value: member.id,
      }));

      setMemberOptions(options);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = () => {
    setIsLoading(true)
    const data = new FormData();
    data.append('site', site);
    data.append('member', member?.value ?? "")
    data.append('date', date.format("YYYY-MM-DD hh:mm"))
    data.append('transaction_type', transactionType)
    data.append('tube_status', tubeStatus)
    data.append('note', note)
    data.append('nominal', nominal)
    if (document) {
      data.append('document', document[0])
    }
    barcodes.map((item) => {
      data.append('barcodes[]', item.value)
    })

    axios.post(ApiEndpoint.CREATE_MEMBER_TRANSACCTION, data)
    .then((res) => {
      console.log('success');
    })
    .catch((err) => {
      setErrors(err?.response?.data?.errors);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    getSiteOptions()
    getMemberOptions()
  }, [])

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
        <Box>
          <Card>
            <CardContent>
              <Grid container columnSpacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl variant="standard" fullWidth className="outlined">
                    <FormLabel component="label">Tanggal *</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        value={date}
                        format="DD/MM/YYYY hh:mm"
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
                    {errors != undefined && errors['date'] && <FormLabel component="label" className="text-error! ml-4 mt-0.25 text-sm!">{errors['date'][0]}</FormLabel>} 
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Cabang *</FormLabel>
                    <Select
                      value={site}
                      label="Jenis"
                      onChange={(e: any) => setSite(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                    >
                      {siteOptions.map((item: any, idx: any) => (
                        <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel component="label">Member</FormLabel>
                    <Autocomplete
                      size="small"
                      popupIcon={<NiChevronDownSmall />}
                      clearIcon={<NiCross />}
                      value={member}
                      options={memberOptions}
                      getOptionKey={(option) => option.value}
                      onChange={(_, val) => val !== null && setMember(val)}
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
                    />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Masuk/Keluar *</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={transactionType}
                      onChange={(e) => setTransactionType((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="in"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Masuk"
                      />
                      <FormControlLabel
                        value="out"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Keluar"
                      />
                      <FormControlLabel
                        value="return"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Retur"
                      />
                      <FormControlLabel
                        value="sell"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Jual"
                      />
                    </RadioGroup>
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
                      />
                      <FormControlLabel
                        value="empty"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Kosong"
                      />
                      <FormControlLabel
                        value="broken"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Rusak"
                      />
                      <FormControlLabel
                        value="expired"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Afkir"
                      />
                      <FormControlLabel
                        value="display"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Display"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Catatan</FormLabel>
                    <Input value={note} placeholder="" onChange={(e: any) => setNote(e.target.value)} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Jaminan Nominal</FormLabel>
                    <Input type="number" value={nominal} placeholder="" onChange={(e: any) => setNominal(e.target.value)} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Jaminan Dokumen</FormLabel>
                    <Box
                      {...getRootProps({ className: "dropzone" })}
                      className="border-grey-200 hover:border-grey-500 flex min-h-22.5 flex-row flex-wrap gap-2.5 rounded-md border p-4 transition-all"
                    >
                      <input {...getInputProps()} />
                      {document.length > 0 ? (
                        thumbs
                      ) : (
                        <Typography variant="body1" className="pointer-events-none w-full self-center text-center">
                          Pilih dokumen atau gambar
                        </Typography>
                      )}
                    </Box>
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
                              if (manualBarcode != "" || manualBarcode != undefined) {
                                if (!checkBarcodeExists(manualBarcode)) {
                                  setBarcodes(prev => [...prev, { id: crypto.randomUUID().toString(), value: manualBarcode }])
                                }
                                setManualBarcode("")
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <Button
                        className="icon-only"
                        size="large"
                        color="primary"
                        variant="contained"
                        onClick={() => setScanPaused(!scanPaused)}
                        startIcon={<NiCamera size={"large"} />}
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
                    {barcodes.map((item, key) => (
                      <Grid key={key} size={{ xs: 12, md: 6, lg: 4 }} className="flex justify-between items-center rounded border border-grey-100 p-2">
                        <Box>{item.value}</Box>
                        <Button
                          onClick={() => deleteBarcode(item.id)}
                          className="icon-only p-1!"
                          size="small"
                          endIcon={<NiCross />}
                          variant="pastel"
                          color="error"
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
              <Box className="w-full flex justify-end">
                <Button
                  size="large"
                  endIcon={<NiFloppyDisk />}
                  loading={isLoading}
                  loadingPosition="end"
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