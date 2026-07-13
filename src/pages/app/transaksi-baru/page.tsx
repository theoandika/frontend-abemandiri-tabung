import { useEffect, useState } from "react";
import { useParams } from "react-router";
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
  Checkbox,
  Autocomplete,
  TextField,
  RadioGroup,
  Radio,
  Divider
} from "@mui/material";
import Axios from "@/api/axios"
import ApiEndpoint from "@/api/api-endpoint"
import { cn } from "@/lib/utils";
import { useZxing } from 'react-zxing';

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { CheckboxSmallChecked, CheckboxSmallEmpty } from "@/icons/form/mui-checkbox";
import NiUploadCloud from "@/icons/nexture/ni-upload-cloud";
import { styled } from '@mui/material/styles';
import NiCross from "@/icons/nexture/ni-cross";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmpty } from "@/icons/form/mui-radiobutton";
import NiCamera from "@/icons/nexture/ni-camera";

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
  const [member, setMember] = useState()
  const [memberOptions, setMemberOptions] = useState<{ label: string; value: string | number }[]>([])
  const [date, setDate] = useState("")
  const [transactionType, setTransactionType] = useState("")
  const [tubeStatus, setTubeStatus] = useState("")
  const [note, setNote] = useState("")
  const [nominal, setNominal] = useState("")
  const [document, setDocument] = useState(null)
  const [barcodes, setBarcodes] = useState([])
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [scan, setScan] = useState(null);
  const [ deviceId, setDeviceId ] = useState<string>("");

  const { ref } = useZxing({
    deviceId: deviceId
  });

  const getContentOptions = () => {
    setIsLoading(true)
    Axios.get(ApiEndpoint.SITE_ALL)
    .then((res) => {
      setSiteOptions(res?.data?.data)
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
        label: member.name,
        value: member.id,
      }));

      setMemberOptions(options);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = (e: any) => {
    e.preventDefault();

  }

  useEffect(() => {
    getContentOptions()
    getMemberOptions()
  }, [])

  useEffect(() => {
  (async () => {
    try {
      const availableDevices = await navigator.mediaDevices.enumerateDevices();
      const availableVideoDevices = availableDevices.filter(device => device.kind === 'videoinput');
      if (availableVideoDevices.length === 1) {
        setDeviceId(availableDevices[0].deviceId)
      }
      if (availableVideoDevices.length === 0) {
        console.log('no device found');
      } else {
        console.log(availableVideoDevices);
        setDevices(availableVideoDevices);
      }
    }
    catch (e) {
      
    }
  })()}, []);

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
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Cabang</FormLabel>
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
                  <FormControl variant="standard" fullWidth className="outlined">
                    <FormLabel component="label">Tanggal</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DateTimePicker
                        // value={dayjs(date)}
                        format="DD/MM/YYYY hh:mm"
                        className="mb-0"
                        // onChange={(e: any) => setDate(e.target.value)}
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
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Masuk/Keluar</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={transactionType}
                      onChange={(e) => setTransactionType((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="in"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Masuk"
                      />
                      <FormControlLabel
                        value="out"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Keluar"
                      />
                      <FormControlLabel
                        value="return"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Retur"
                      />
                      <FormControlLabel
                        value="sell"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Jual"
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
                  <FormControl>
                    <FormLabel>Kondisi Tabung</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={tubeStatus}
                      onChange={(e) => setTubeStatus((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="filled"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Isi"
                      />
                      <FormControlLabel
                        value="empty"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Kosong"
                      />
                      <FormControlLabel
                        value="broken"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Rusak"
                      />
                      <FormControlLabel
                        value="expired"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Afkir"
                      />
                      <FormControlLabel
                        value="display"
                        control={<Radio icon={<RadiobuttonSmallEmpty />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Display"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Jaminan Nominal</FormLabel>
                    <Input type="number" value={nominal} placeholder="" onChange={(e: any) => setNominal(e.target.value)} />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth>
                    <FormLabel component="label">Jaminan Dokumen</FormLabel>
                    <Button
                      component="label"
                      role={undefined}
                      variant="contained"
                      tabIndex={-1}
                      startIcon={<NiUploadCloud />}
                    >
                      Upload files
                      <VisuallyHiddenInput
                        type="file"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={(event) => console.log(event.target.files)}
                      />
                    </Button>
                  </FormControl>
                </Grid>
              </Grid>

              <Box className="flex border border-grey-100 p-4 rounded-md my-4">
                <Box>
                  <Button
                    className="icon-only"
                    size="large"
                    color="primary"
                    variant="contained"
                    startIcon={<NiCamera size={"large"} />}
                  />
                </Box>
                <Box className="flex flex-col">
                  <Typography variant="subtitle2">
                    Hasil Scan
                  </Typography>
                  <video width="300" ref={ref} />
                </Box>
              </Box>
              <Box className="w-full flex justify-end">
                <Button
                  size="large"
                  endIcon={<NiFloppyDisk />}
                  // loading={isLoading}
                  loadingPosition="end"
                  variant="pastel"
                  color="primary"
                >Simpan</Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
}