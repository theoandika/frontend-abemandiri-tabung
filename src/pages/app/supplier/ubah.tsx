import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  Typography,
  Grid,
  Collapse,
  Alert
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import axios from "@/api/axios";
import { useNavigate, useParams } from "react-router-dom";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";

export default function UbahSupplier() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [code, setCode] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [description, setDescription] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const initData = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SUPPLIER + "/" + id)
    .then((res) => {
      let data = res.data?.data
      setCode(data?.code)
      setName(data?.name)
      setDescription(data?.description)
    })
    .catch(() => {
      navigate("/404")
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    initData()
  }, [])

  const save = () => {
    setIsLoading(true)
    const data = {
      code,
      name,
      description
    }

    axios.post(ApiEndpoint.SUPPLIER + "/" + id, data)
    .then(() => {
      navigate('/supplier')
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

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Ubah Supplier
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
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Kode</FormLabel>
                    <Input placeholder="" value={code} onChange={e => setCode(e.target.value)} />
                    {errors != undefined && errors['code'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['code'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Nama Supplier *</FormLabel>
                    <Input placeholder="" value={name} onChange={e => setName(e.target.value)} />
                    {errors != undefined && errors['name'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['name'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Deskripsi</FormLabel>
                    <Input placeholder="" value={description} onChange={e => setDescription(e.target.value)} />
                    {errors != undefined && errors['description'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['description'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
              </Grid>

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
