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
  Checkbox,
  Collapse,
  Alert
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { CheckboxSmallChecked, CheckboxSmallEmptyOutlined } from "@/icons/form/mui-checkbox";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import { useDropzone } from "react-dropzone";
import axios from "@/api/axios";
import { useNavigate } from "react-router-dom";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";

export default function Page() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [number, setNumber] = useState("")
  const [barcode, setBarcode] = useState("")
  const [type, setType] = useState("")
  const [content, setContent] = useState("")
  const [contentOptions, setContentOptions] = useState([])
  const [own, setOwn] = useState(true)
  const [active, setActive] = useState(true)
  const [photo, setPhoto] = useState<(any & { preview: string }[])>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/png": [],
      "image/jpg": [],
      "image/jpeg": [],
    },
    onDrop: (acceptedFiles) => {
      const newFiles: any[] = [];
      acceptedFiles.map((file) => {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        newFiles.push(newFile);
      });
      setPhoto(newFiles);
    },
  });

  const getContentOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.TUBE_CONTENT_ALL)
    .then((res) => {
      setContentOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = () => {
    setIsLoading(true)
    const data = new FormData();
    data.append('number', number);
    data.append('barcode', barcode);
    data.append('type', type);
    data.append('content', content);
    data.append('own', own ? '1' : '0');
    data.append('active', active ? '1' : '0');
    if (photo.length) {
      data.append('photo', photo[0])
    }

    axios.post(ApiEndpoint.CREATE_TUBE, data)
    .then(() => {
      navigate('/tabung')
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
    getContentOptions()
  }, [])

  const handleRemoveImage = () => {
    setPhoto([]);
  };

  const thumbs = photo.map((file: any) => (
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
                    <FormLabel component="label">Nomor Tabung *</FormLabel>
                    <Input placeholder="" value={number} onChange={e => setNumber(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['number'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['number'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Barcode</FormLabel>
                    <Input placeholder="" value={barcode} onChange={e => setBarcode(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['barcode'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['barcode'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Jenis *</FormLabel>
                    <Select
                      value={type}
                      label="Jenis"
                      onChange={(e) => setType(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="medical">Medis</MenuItem>
                      <MenuItem value="industry">Industri</MenuItem>
                    </Select>
                    {errors != undefined && errors['type'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['type'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Isi *</FormLabel>
                    <Select
                      value={content}
                      label="Isi"
                      onChange={(e) => setContent(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      {contentOptions.map((item: any, key: any) => (
                        <MenuItem key={key} value={item?.id}>{item?.code} - {item?.name}</MenuItem>
                      ))}
                    </Select>
                    {errors != undefined && errors['content'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['content'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={own}
                          icon={<CheckboxSmallEmptyOutlined />}
                          checkedIcon={<CheckboxSmallChecked />}
                          onChange={e => setOwn(e.target.value == 'checked' ? true : false)}
                          size="small"
                          disabled={isLoading}
                        />
                      }
                      label="Tabung DM"
                    />
                    {errors != undefined && errors['own'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['own'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          defaultChecked={active}
                          icon={<CheckboxSmallEmptyOutlined />}
                          checkedIcon={<CheckboxSmallChecked />}
                          onChange={e => setActive(e.target.value == 'checked' ? true : false)}
                          size="small"
                          disabled={isLoading}
                        />
                      }
                      label="Aktif"
                    />
                    {errors != undefined && errors['active'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['active'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Foto Tabung</FormLabel>
                    <Box
                      {...getRootProps({ className: "dropzone" })}
                      className="border-grey-200 hover:border-grey-500 flex min-h-22.5 flex-row flex-wrap gap-2.5 rounded-md border p-4 transition-all"
                    >
                      <input {...getInputProps()} disabled={isLoading} />
                      {photo.length > 0 ? (
                        thumbs
                      ) : (
                        <Typography variant="body1" className="pointer-events-none w-full self-center text-center">
                          Pilih file (.png, .jpg)
                        </Typography>
                      )}
                    </Box>
                    {errors != undefined && errors['photo'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['photo'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
              </Grid>

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
