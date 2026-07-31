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
  FormControlLabel,
  Checkbox
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import axios from "@/api/axios";
import { useNavigate } from "react-router-dom";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { CheckboxSmallChecked, CheckboxSmallEmptyOutlined } from "@/icons/form/mui-checkbox";
import { useUserContext } from "@/hooks/use-user";
import { Viewer } from "@/types/types";

export default function Page() {
  const { checkPermission } = useUserContext()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [permissionList, setPermissionList] = useState<{ key?: string, name?: string, scope?: string }[]>([])
  const [name, setName] = useState<string>("")
  const [permissions, setPermissions] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const save = () => {
    setIsLoading(true)
    const data = {
      name,
      permissions
    }

    axios.post(ApiEndpoint.ROLE, data)
    .then(() => {
      navigate('/role')
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

  const getPermissionList = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.PERMISSION)
    .then(res => {
      setPermissionList(res?.data)
    })
    .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    if (!checkPermission([Viewer.ADMINISTRATOR], [])) {
      navigate('/404')
    } else {
      getPermissionList()
    }
  }, [])

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Tambah Role
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
                <Grid size={12}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Nama *</FormLabel>
                    <Input placeholder="" value={name} onChange={e => setName(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['name'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['name'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <Typography variant="h6">Hak Akses</Typography>
                </Grid>
                {permissionList.map(item => (
                  item.scope != undefined ? (
                    <Grid size={12} className="p-2 bg-text-muted/50">{item.scope}</Grid>
                  ) : (
                    <Grid size={{ lg: 4, sm:6, xs: 12 }}>
                      <FormControl>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={permissions.findIndex(p => p == item.key) !== -1}
                              icon={<CheckboxSmallEmptyOutlined />}
                              checkedIcon={<CheckboxSmallChecked />}
                              onChange={e => {
                                let exists = permissions.findIndex(el => el == item.key)
                                let old = [...permissions]
                                if (e.target.checked) {
                                  if (exists === -1) {
                                    old.push(item.key ?? "")
                                  }
                                  if (item.key == "manage-all") {
                                    old = old.filter(el => el == "manage-all")
                                  }
                                } else {
                                  if (exists !== -1) {
                                    old.splice(exists, 1)
                                  }
                                }
                                setPermissions(old)
                              }}
                              size="small"
                              disabled={isLoading || (item.key != "manage-all" && permissions.findIndex(p => p == "manage-all") !== -1)}
                              slotProps={{
                                input: { 'aria-label': 'controlled' },
                              }}
                            />
                          }
                          label={item.name}
                        />
                        {errors != undefined && errors['active'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['active'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                  )
                ))}
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
