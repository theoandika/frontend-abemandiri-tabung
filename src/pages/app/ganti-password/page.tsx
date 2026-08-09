import { useState } from "react";
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
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiCheckSquare from "@/icons/nexture/ni-check-square";

export default function GantiPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [newPassword, setNewPassword] = useState<string>("")
  const [newPasswordConfirmation, setNewPasswordConfirmation] = useState<string>("")
  const [oldPassword, setOldPassword] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [successMessage, setSuccessMessage] = useState<string>("")

  const save = () => {
    setIsLoading(true)
    const data = {
      new_password: newPassword,
      new_password_confirmation: newPasswordConfirmation,
      old_password: oldPassword
    }

    axios.post(ApiEndpoint.CHANGE_PASSWORD, data)
    .then(() => {
      setSuccessMessage("Password berhasil diubah")
      setErrors({})
      setErrorMessage("")
      setNewPassword("")
      setNewPasswordConfirmation("")
      setOldPassword("")
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
            Ganti Password
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
        {successMessage && (
            <Box>
              <Collapse in={true}>
                <Alert className="mb-2" color="success" icon={<NiCheckSquare />} >
                  {successMessage}
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
                    <FormLabel component="label">Password Baru *</FormLabel>
                    <Input type="password" placeholder="" value={newPassword} onChange={e => setNewPassword(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['new_password'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['new_password'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Konfirmasi Password Baru *</FormLabel>
                    <Input type="password" placeholder="" value={newPasswordConfirmation} onChange={e => setNewPasswordConfirmation(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['new_password_confirmation'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['new_password_confirmation'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={12}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Password Lama *</FormLabel>
                    <Input type="password" placeholder="" value={oldPassword} onChange={e => setOldPassword(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['old_password'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['old_password'][0]}</FormLabel>}
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
