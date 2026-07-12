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
  Checkbox
} from "@mui/material";
import Axios from "@/api/axios"
import ApiEndpoint from "@/api/api-endpoint"

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { CheckboxSmallChecked, CheckboxSmallEmpty } from "@/icons/form/mui-checkbox";
import NiUploadCloud from "@/icons/nexture/ni-upload-cloud";
import { styled } from '@mui/material/styles';

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
  const [number, setNumber] = useState("")
  const [barcode, setBarcode] = useState("")
  const [type, setType] = useState("")
  const [typeOptions, setTypeOptions] = useState([])
  const [content, setContent] = useState("")
  const [contentOptions, setContentOptions] = useState([])
  const [own, setOwn] = useState(true)
  const [active, setActive] = useState(true)
  const [photo, setPhoto] = useState(null)

  const getContentOptions = () => {
    setIsLoading(true)
    Axios.get(ApiEndpoint.TUBE_CONTENT_ALL)
    .then((res) => {
      setContentOptions(res?.data?.data)
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
  }, [])

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Tambah Tabung
          </Typography>
        </Grid>
      </Grid>

      <Grid size={12}>
        <Box>
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Nomor Tabung</FormLabel>
                    <Input placeholder="" />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Barcode</FormLabel>
                    <Input placeholder="" />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Jenis</FormLabel>
                    <Select
                      value={type}
                      label="Jenis"
                      onChange={(e) => setType(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                    >
                      <MenuItem value="medical">Medis</MenuItem>
                      <MenuItem value="industry">Industri</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Isi</FormLabel>
                    <Select
                      value={content}
                      label="Isi"
                      onChange={(e) => setContent(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                    >
                      {contentOptions.map((item: any, key: any) => (
                        <MenuItem key={key} value={item?.id}>{item?.code} - {item?.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl>
                    <FormControlLabel
                        control={
                          <Checkbox
                            defaultChecked={own}
                            icon={<CheckboxSmallEmpty />}
                            checkedIcon={<CheckboxSmallChecked />}
                            size="small"
                          />
                        }
                        label="Tabung DM"
                      />
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl>
                    <FormControlLabel
                        control={
                          <Checkbox
                            defaultChecked={active}
                            icon={<CheckboxSmallEmpty />}
                            checkedIcon={<CheckboxSmallChecked />}
                            size="small"
                          />
                        }
                        label="Aktif"
                      />
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl fullWidth>
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

              <Button
                size="large"
                endIcon={<NiFloppyDisk />}
                // loading={isLoading}
                loadingPosition="end"
                variant="pastel"
                color="primary"
              >Simpan</Button>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    </Grid>
  );
}
