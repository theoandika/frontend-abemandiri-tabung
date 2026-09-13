import { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Typography,
  Grid,
  Collapse,
  Alert,
  Autocomplete,
  TextField,
  CircularProgress
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import axios from "@/api/axios";
import { useNavigate } from "react-router-dom";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { useUserContext } from "@/hooks/use-user";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCross from "@/icons/nexture/ni-cross";
import dayjs from "dayjs";
import 'dayjs/locale/id'
import NiCheckSquare from "@/icons/nexture/ni-check-square";

interface DataType {
  id: string
  site: {
    id: string
    name: string
  } | null
  number: string
  barcode: string
  tube_content: {
    id: string
    code: string
    name: string
  } | null
  type: string
  own: boolean
  position: string
  position_name: string
  second_owner: {
    id: string
    code: string | null
    name: string
  } | null
  last_transaction_date: string
  status_naming: string
}

export default function Page() {
  const { checkPermission } = useUserContext()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [barcode, setBarcode] = useState<{ label: string, value: string } | null>(null)
  const [barcodeOptions, setBarcodeOptions] = useState<{ label: string; value: string }[]>([])
  const [data, setData] = useState<DataType | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const getBarcodeOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.BARCODE_LIST)
    .then((res) => {
      setBarcodeOptions(res?.data?.data?.map((el: any) => ({ label: el, value: el })))
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const search = () => {
    setData(null)
    setErrorMessage("")
    setErrors({})
    setIsLoading(true)
    axios.post(ApiEndpoint.LAST_TUBE_POSITION, { barcode: barcode?.value })
    .then((res) => {
      setData(res?.data?.data)
    })
    .catch((err) => {
      let errData = err?.response?.data
      setErrors(errData?.errors);
      setErrorMessage(errData?.message);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-last-tube-position'])) {
      navigate('/404')
    } else {
      getBarcodeOptions();
    }
  }, [])

  useEffect(() => {
    if (barcode != null) {
      search()
    }
  }, [barcode])

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Posisi Tabung Terakhir
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
              <FormControl fullWidth>
                <FormLabel component="label">Barcode *</FormLabel>
                <Autocomplete
                  size="small"
                  popupIcon={<NiChevronDownSmall />}
                  clearIcon={<NiCross />}
                  value={barcode}
                  options={barcodeOptions}
                  getOptionKey={(option) => option.value}
                  onChange={(_, val) => setBarcode(val ?? null)}
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
                {errors != undefined && errors['barcode'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['barcode'][0]}</FormLabel>}
              </FormControl>
            </CardContent>
          </Card>
        </Box>
        {isLoading && (
          <Box className="flex flex-row items-center justify-center h-25">
            <CircularProgress color="primary" size={32} />
          </Box>
        )}
        {data != null && (
          <Box className="mt-4">
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6, md: 4}}>
                    Cabang :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.site?.name}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Nomor Tabung :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.number}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Isi Tabung :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.tube_content?.code} - {data?.tube_content?.name}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Jenis :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.type == 'medical' ? 'Medis' : 'Industri'}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Tabung DM :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data?.own ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
                  </Grid>
                  {data.second_owner != null && (
                    <>
                      <Grid size={{ xs: 6, md: 4}}>
                        Pemilik Tabung :
                      </Grid>
                      <Grid size={{ xs: 6, md: 8}}>
                        {data.second_owner?.code} - {data?.second_owner?.name}
                      </Grid>
                    </>
                  )}
                  <Grid size={{ xs: 6, md: 4}}>
                    Lokasi Tabung :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.position == 'site' && 'Cabang'}
                    {data.position == 'member' && 'Member'}
                    {data.position == 'supplier' && 'Supplier'}
                    {data.position == 'transit' && 'Transit'}
                    {data.position == 'unknown' && 'Tidak Diketahui'}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Nama Lokasi :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.position_name}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Tanggal Transaksi Terakhir :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {dayjs(data?.last_transaction_date).locale('id').format("DD MMMM YYYY HH:mm")}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Posisi Tabung :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data.status_naming}
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        )}
      </Grid>
    </Grid>
  );
}
