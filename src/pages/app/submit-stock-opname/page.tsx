import ApiEndpoint from "@/api/api-endpoint";
import { useUserContext } from "@/hooks/use-user";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiCross from "@/icons/nexture/ni-cross";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { Box, Button, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl, FormLabel, Alert, Input, Collapse } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/id'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NiPlus from "@/icons/nexture/ni-plus";

interface Site {
  id: string
  name: string
}

interface ContentType {
  id: string
  code: string
  name: string
}

export default function DetailMemberTransaction() {
  const { checkPermission } = useUserContext()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [site, setSite] = useState<string>("")
  const [siteOptions, setSiteOptions] = useState<Site[]>([])
  const [contentTypeOptions, setContentTypeOptions] = useState<ContentType[]>([])
  const [contentType, setContentType] = useState<string>("")
  const [pic, setPic] = useState<string>("")
  const [tubeStatus, setTubeStatus] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")

  const getSiteOptions = () => {
    axios.get(ApiEndpoint.SITE_ALL)
    .then(res => {
      setSiteOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getContentTypeOptions = () => {
    axios.get(ApiEndpoint.TUBE_CONTENT_ALL)
    .then(res => {
      setContentTypeOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['create-stock-opname'])) {
      navigate('/404')
    } else {
      getSiteOptions()
      getContentTypeOptions()
    }
  }, [])

  const save = () => {
    setIsLoading(true)
    const dataToSubmit = {
      date: date.format("YYYY-MM-DD HH:mm"),
      site: site,
      content: contentType,
      pic: pic,
      tube_status: tubeStatus
    }
    axios.post(ApiEndpoint.STOCK_OPNAME, dataToSubmit)
    .then((res) => {
      navigate("/stock-opname/" + res?.data?.data?.id)
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrors(errData?.errors);
      setErrorMessage(errData?.message);
    })
    .finally(() => setIsLoading(false))
  }

  return (
    <Grid container spacing={5}>
      <Grid size={12}>
        <Box className="flex items-center gap-5">
          <Typography variant="h1" component="h1" className="mb-0">
            Tambah Stock Opname
          </Typography>
        </Box>
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
        <Card>
          <CardContent>
            <Grid container columnSpacing={4}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl variant="standard" fullWidth className="outlined">
                  <FormLabel component="label">Tanggal *</FormLabel>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DateTimePicker
                      disableFuture
                      disabled={isLoading}
                      value={date}
                      format="DD/MM/YYYY H:m"
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
                <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
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
                <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                  <FormLabel component="label">Isi Tabung *</FormLabel>
                  <Select
                    value={contentType}
                    label="Cabang"
                    onChange={(e: any) => setContentType(e.target.value)}
                    IconComponent={NiChevronDownSmall}
                    MenuProps={{ className: "outlined" }}
                    disabled={isLoading}
                  >
                    {contentTypeOptions.map((item: ContentType, idx: any) => (
                      <MenuItem key={idx} value={item?.id}>{item?.code} - {item?.name}</MenuItem>
                    ))}
                  </Select>
                  {errors != undefined && errors['content'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['content'][0]}</FormLabel>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl className="outlined" variant="standard" size="small" fullWidth>
                  <FormLabel component="label">PIC Opname *</FormLabel>
                  <Input value={pic} placeholder="" onChange={(e: any) => setPic(e.target.value)} disabled={isLoading} />
                  {errors != undefined && errors['pic'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['pic'][0]}</FormLabel>}
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                  <FormLabel component="label">Kondisi Tabung *</FormLabel>
                  <Select
                    value={tubeStatus}
                    label="Cabang"
                    onChange={(e: any) => setTubeStatus(e.target.value)}
                    IconComponent={NiChevronDownSmall}
                    MenuProps={{ className: "outlined" }}
                    disabled={isLoading}
                  >
                    <MenuItem value="filled">Isi</MenuItem>
                    <MenuItem value="empty">Kosong</MenuItem>
                    <MenuItem value="broken">Rusak</MenuItem>
                    <MenuItem value="expired">Afkir</MenuItem>
                    <MenuItem value="display">Pajangan</MenuItem>
                  </Select>
                  {errors != undefined && errors['tube_status'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['tube_status'][0]}</FormLabel>}
                </FormControl>
              </Grid>
            </Grid>
            <Box className="w-full flex justify-end">
              <Button
                size="large"
                startIcon={<NiPlus />}
                loading={isLoading}
                loadingPosition="start"
                variant="pastel"
                color="primary"
                onClick={() => save()}
              >Buat</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
