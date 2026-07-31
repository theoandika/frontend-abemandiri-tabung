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
  Alert,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  IconButton
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import axios from "@/api/axios";
import { useNavigate } from "react-router-dom";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { CheckboxSmallChecked, CheckboxSmallEmptyOutlined } from "@/icons/form/mui-checkbox";
import NiEyeClose from "@/icons/nexture/ni-eye-close";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import { useUserContext } from "@/hooks/use-user";
import { Viewer } from "@/types/types";

export default function Page() {
  const { checkPermission } = useUserContext()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [role, setRole] = useState<string>("")
  const [sites, setSites] = useState<string[]>([])
  const [active, setActive] = useState<boolean>(true)
  const [siteOptions, setSiteOptions] = useState<{ id: string, name: string }[]>([])
  const [roleOptions, setRoleOptions] = useState<{ id: string, name: string }[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const getSiteOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SITE_ALL)
    .then((res) => {
      setSiteOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getRoleOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.ROLE)
    .then((res) => {
      setRoleOptions(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = () => {
    setIsLoading(true)
    const data = {
      name,
      email,
      role,
      sites,
      password,
      is_active: active
    }

    axios.post(ApiEndpoint.USER, data)
    .then(() => {
      navigate('/user')
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
    if (!checkPermission([Viewer.ADMINISTRATOR], [])) {
      navigate('/404')
    } else {
      getSiteOptions()
      getRoleOptions()
    }
  }, [])

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Tambah User
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
                    <FormLabel component="label">Nama *</FormLabel>
                    <Input placeholder="" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['name'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['name'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
                    <FormLabel component="label">Role *</FormLabel>
                    <Select
                      value={role}
                      label="Cabang"
                      onChange={(e: any) => setRole(e.target.value)}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      {roleOptions.map((item: any, idx: any) => (
                        <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                      ))}
                    </Select>
                    {errors != undefined && errors['role'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['role'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Email *</FormLabel>
                    <Input type="email" placeholder="" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['email'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['email'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Password *</FormLabel>
                    <Input
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                              <NiEyeClose size="medium" className="text-text-secondary" />
                            ) : (
                              <NiEyeOpen size="medium" className="text-text-secondary" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                      placeholder="" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['password'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['password'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={12} className="flex items-center">
                  <FormControl>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={active}
                          icon={<CheckboxSmallEmptyOutlined />}
                          checkedIcon={<CheckboxSmallChecked />}
                          onChange={e => setActive(e.target.checked)}
                          size="small"
                          disabled={isLoading}
                          slotProps={{
                            input: { 'aria-label': 'controlled' },
                          }}
                        />
                      }
                      label="Aktif"
                    />
                  </FormControl>
                </Grid>
                <Grid size={12} container>
                  <Grid size={12}>
                    <FormLabel component="label">Akses Cabang</FormLabel>
                  </Grid>
                  {siteOptions.map(item => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                      <FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={sites.findIndex(p => p == item.id) !== -1}
                              icon={<CheckboxSmallEmptyOutlined />}
                              checkedIcon={<CheckboxSmallChecked />}
                              onChange={e => {
                                let exists = sites.findIndex(el => el == item.id)
                                let old = [...sites]
                                if (e.target.checked) {
                                  if (exists === -1) {
                                    old.push(item.id ?? "")
                                  }
                                } else {
                                  if (exists !== -1) {
                                    old.splice(exists, 1)
                                  }
                                }
                                setSites(old)
                              }}
                              size="small"
                              disabled={isLoading}
                              slotProps={{
                                input: { 'aria-label': 'controlled' },
                              }}
                            />
                          }
                          label={item.name}
                        />
                      </FormControl>
                    </Grid>
                  ))}
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
