import { useFormik } from "formik";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  capitalize,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  InputAdornment,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";

import Logo from "@/components/logo/logo";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiEyeClose from "@/icons/nexture/ni-eye-close";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import axios from "@/api/axios"
import ApiEndpoint from "@/api/api-endpoint";
import { useUserContext } from "@/hooks/use-user";
import NiEnterRight from "@/icons/nexture/ni-enter-right";
import Loading from "./loading";

const validationSchema = yup.object({
  email: yup.string().required("Masukkan email").email("Email tidak valid"),
  password: yup.string().required("Masukkan password"),
});

type InputErrorProps = {
  title: string;
};

const InputErrorTooltip = ({ title }: InputErrorProps) => {
  return (
    <Box className="relative">
      <Tooltip title={title} arrow className="absolute -top-1.5">
        <Button
          startIcon={<NiCrossSquare size="small" />}
          color="error"
          size="small"
          className="group icon-only bg-transparent! outline-0!"
        ></Button>
      </Tooltip>
    </Box>
  );
};

export default function Page() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setToken, setUser } = useUserContext();
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  const checkLogged = () => {
    axios.get(ApiEndpoint.ACCOUNT)
    .then((res2) => {
      setUser(res2?.data?.data)
      navigate('/dashboard')
    })
    .catch(() => {
      setIsLoadingPage(false)
    })
  } 

  const submit = () => {
    setIsLoading(true)    
    axios.post(ApiEndpoint.LOGIN, {
      email: formik.values.email,
      password: formik.values.password
    })
    .then((res) => {
      setToken(res?.data?.data?.token);
      axios.get(ApiEndpoint.ACCOUNT)
      .then((res2) => {
        setUser(res2?.data?.data)
        navigate('/dashboard')
      })
      .finally(() => {
        setIsLoading(false)
      })
    })
    .catch((err) => {
      if(err.response){
        setError(err.response?.data?.message)
      }
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const formik = useFormik({
    initialValues: {
      email: "root@abemandiri.co.id",
      password: "password",
    },
    validationSchema,
    onSubmit: submit,
    validateOnBlur: false,
    validateOnMount: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  useEffect(() => {
    checkLogged()
  }, [])

  if (isLoadingPage) return <Loading />

  return (
    <Box className="bg-waves flex min-h-screen w-full items-center justify-center bg-cover bg-center p-4">
      <Paper elevation={3} className="bg-background-paper shadow-darker-xs w-lg max-w-full rounded-4xl py-14">
        <Box className="flex flex-col gap-4 px-8 sm:px-14">
          <Box className="flex flex-col">
            <Box className="mb-14 flex justify-center">
              <Logo className="w-max-100" />
            </Box>

            {error && (
              <Alert severity="error" icon={<NiCrossSquare />} className="neutral bg-background-paper/60! mb-4">
                <AlertTitle variant="subtitle2">Error!</AlertTitle>
                <Typography variant="body2" className="text-text-primary">
                  {error}
                </Typography>
              </Alert>
            )}

            <Box className="flex flex-col gap-10">
              <Box className="flex flex-col">
                <Typography variant="h1" component="h1" className="mb-2">
                  Masuk
                </Typography>
                <Typography variant="body1" className="text-text-primary">
                  Masuk untuk melanjutkan
                </Typography>
              </Box>

              <Box className="flex flex-col gap-5">
                <Box
                  component={"form"}
                  onSubmit={(event) => {
                    setSubmitted(true);
                    formik.handleSubmit(event);
                  }}
                  className="flex flex-col"
                >
                  <FormControl className="outlined" variant="standard" size="small">
                    <FormLabel component="label" className="flex flex-row">
                      Email
                      {formik.touched.email && formik.errors.email && <InputErrorTooltip title={formik.errors.email} />}
                    </FormLabel>
                    <Input
                      id="email"
                      name="email"
                      placeholder=""
                      value={formik.values.email}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </FormControl>

                  <FormControl className="outlined" variant="standard" size="small">
                    <FormLabel component="label" className="flex flex-row">
                      Password
                      {formik.touched.password && formik.errors.password && (
                        <InputErrorTooltip title={formik.errors.password} />
                      )}
                    </FormLabel>
                    <Input
                      size="small"
                      id="password"
                      name="password"
                      placeholder=""
                      autoComplete="off"
                      value={formik.values.password}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      type={showPassword ? "text" : "password"}
                      endAdornment={
                        <InputAdornment position="end">
                          <IconButton
                            onClick={handleClickShowPassword}
                            onMouseDown={handleMouseDownPassword}
                            onMouseUp={handleMouseUpPassword}
                          >
                            {showPassword ? (
                              <NiEyeClose size="medium" className="text-text-secondary" />
                            ) : (
                              <NiEyeOpen size="medium" className="text-text-secondary" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      }
                    />
                  </FormControl>

                  {submitted && !formik.isValid && (
                    <Alert severity="error" icon={<NiCrossSquare />} className="neutral bg-background-paper/60! mb-4">
                      <AlertTitle variant="subtitle2">Error!</AlertTitle>
                      {Object.entries(formik.errors).map(([key, value]) => {
                        return (
                          <Box className="flex flex-row gap-0.5" key={crypto.randomUUID()}>
                            <Typography variant="body2" className="text-error">
                              {capitalize(key)}:
                            </Typography>
                            <Typography variant="body2" className="text-text-primary">
                              {value}
                            </Typography>
                          </Box>
                        );
                      })}
                    </Alert>
                  )}
                  <Box className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      size="large"
                      endIcon={<NiEnterRight size={"large"} />}
                      loading={isLoading}
                      loadingPosition="end"
                      variant="contained"
                      color="primary"
                    >Masuk</Button>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
