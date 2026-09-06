import ApiEndpoint from "@/api/api-endpoint";
import DialogYesNo from "@/components/dialog/dialog-yes-no";
import { useUserContext } from "@/hooks/use-user";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiCheck from "@/icons/nexture/ni-check";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiCross from "@/icons/nexture/ni-cross";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiPen from "@/icons/nexture/ni-pen";
import { Box, Button, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl, FormLabel, FormControlLabel, Alert, Radio, RadioGroup } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/id'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

interface TubeList {
  id: string
  number: string
  barcode: string
  site: {
    id: string
    name: string
  }
  position: string
  tube_status: string
  own: boolean
  second_owner: {
    id: string
    code: string
    name: string
  } | null
}

interface TubeSubmit {
  original_data: TubeList
  id: string
  is_match: boolean | undefined
  adjust: boolean | undefined
  tube_status: string | undefined
  position: string | undefined
  position_id: string | undefined
  supplier_transaction_type: string | undefined
}

interface Site {
  id: string
  name: string
}

interface Member {
  id: string
  code: string
  name: string
}

interface Supplier {
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
  const [contentType, setContentType] = useState<string>("")
  const [pic, setPic] = useState<string>("")
  const [tubeStatus, setTubeStatus] = useState<string>("")
  const [memberOptions, setMemberOptions] = useState<Member[]>([])
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [errorMessage, setErrorMessage] = useState<string>("")

  const tubeStatusOptions = [
    {
      label: "Isi",
      value: "filled"
    },
    {
      label: "Kosong",
      value: "empty"
    },
    {
      label: "Rusak",
      value: "broken"
    },
    {
      label: "Afkir",
      value: "expired"
    },
    {
      label: "Pajangan",
      value: "display"
    },
  ]

  const positionOptions = [
    {
      label: "Cabang",
      value: "site"
    },
    {
      label: "Member",
      value: "member"
    },
    {
      label: "Supplier",
      value: "supplier"
    },
    {
      label: "Transit",
      value: "transit"
    },
  ]

  const getSiteOptions = () => {
    axios.get(ApiEndpoint.SITE_ALL)
    .then(res => {
      setSiteOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getMemberOptions = () => {
    axios.get(ApiEndpoint.MEMBER_ALL)
    .then(res => {
      setMemberOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getSupplierOptions = () => {
    axios.get(ApiEndpoint.SUPPLIER)
    .then(res => {
      setSupplierOptions(res?.data?.data)
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
      getMemberOptions()
      getSupplierOptions()
    }
  }, [])

  const save = () => {
    setIsLoading(true)
    const dataToSubmit = {
      site: site,
    }
    axios.post(ApiEndpoint.STOCK_OPNAME, dataToSubmit)
    .then(() => {
      navigate("/stock-opname")
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
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        {errorMessage && (
          <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
            {errorMessage}
          </Alert>
        )}
      </Grid>
    </Grid>
  );
}
