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
  Autocomplete,
  TextField,
  RadioGroup,
  Radio,
  Collapse,
  Alert,
} from "@mui/material";
import ApiEndpoint from "@/api/api-endpoint"
import { cn } from "@/lib/utils";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import axios from "@/api/axios";
import { useDropzone } from "react-dropzone";

import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCross from "@/icons/nexture/ni-cross";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "@/hooks/use-user";
import NiPlus from "@/icons/nexture/ni-plus";

interface CollateralItem {
  id: string
  tube_content_type?: {
    label: string
    value: string
  } | null
  klep_condition?: string | null
  tube_cap?: string | null
  tube_quantity?: string | null
  nominal?: string | null
}

export default function Page() {
  const { checkPermission } = useUserContext()
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)
  const [contentTypeOptions, setContentTypeOptions] = useState<{label: string; value: string}[]>([])
  const [site, setSite] = useState("")
  const [siteOptions, setSiteOptions] = useState([])
  const [member, setMember] = useState<{ label: string; value: string } | null>(null)
  const [memberOptions, setMemberOptions] = useState<{ label: string; value: string }[]>([])
  const [type, setType] = useState<string>("")
  const [date, setDate] = useState<Dayjs>(dayjs())
  const [documentNumber, setDocumentNumber] = useState("")
  const [pic, setPic] = useState("")
  const [document, setDocument] = useState<(any & { preview: string }[])>([]);
  const [memberName, setMemberName] = useState<string>("")
  const [memberAddress, setMemberAddress] = useState<string>("")
  const [signatoryStatus, setSignatoryStatus] = useState<string>("")
  const [companyName, setCompanyName] = useState<string>("")
  const [contactPerson, setContactPerson] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")
  const [paymentDate, setPaymentDate] = useState<Dayjs | null>(null)
  const [collateralAudit, setCollateralAudit] = useState<string>("")
  const [returnPaymentMethod, setReturnPaymentMethod] = useState<string>("")
  const [returnPaymentDate, setReturnPaymentDate] = useState<Dayjs | null>(null)
  const [returnAudit, setReturnAudit] = useState<string>("")
  const [collateralItems, setCollateralItems] = useState<CollateralItem[]>([
    {
      id: crypto.randomUUID(),
      tube_content_type: null,
      klep_condition: null,
      tube_cap: null,
      tube_quantity: "1",
      nominal: "0",
    }
  ])
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [],
    },
    onDrop: (acceptedFiles) => {
      const newFiles: any[] = [];
      acceptedFiles.map((file) => {
        const newFile = Object.assign(file, {
          preview: URL.createObjectURL(file),
        });
        newFiles.push(newFile);
      });
      setDocument(newFiles);
    },
  });

  const handleRemoveImage = () => {
    setDocument([]);
  };

  const thumbs = document.map((file: any) => (
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

  const getSiteOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SITE_ALL)
    .then((res) => {
      setSiteOptions(res?.data?.data)
      if (res?.data?.data?.length === 1) {
        setSite(res?.data?.data[0]?.id)
      }
    })
    .finally(() => {
      setIsLoading(false)
    })
  }
  const getMemberOptions = () => {
    setMemberOptions([])
    setIsLoading(true)
    axios.get(ApiEndpoint.MEMBER_ALL)
    .then((res) => {
      const options = res.data.data.map((member: any) => ({
        label: `${member.code} - ${member.name}`,
        value: member.id,
      }));

      setMemberOptions(options);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }
  const getContentTypeOptions = () => {
    setContentTypeOptions([])
    setIsLoading(true)
    axios.get(ApiEndpoint.TUBE_CONTENT_ALL)
    .then((res) => {
      const options = res.data.data.map((content: any) => ({
        label: `${content.code} - ${content.name}`,
        value: content.id,
      }));
      setContentTypeOptions(options);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const save = () => {
    setIsLoading(true)
    const data = new FormData();
    data.append('site', site);
    data.append('member', member?.value ?? "")
    data.append('date', date.format("YYYY-MM-DD"))
    data.append('type', type)
    data.append('pic', pic)
    data.append('document_number', documentNumber)
    data.append('member_name', memberName)
    data.append('member_address', memberAddress)
    data.append('signatory_status', signatoryStatus)
    data.append('company_name', companyName)
    data.append('contact_person', contactPerson)
    data.append('payment_method', paymentMethod)
    data.append('payment_date', paymentDate?.format("YYYY-MM-DD") ?? "")
    data.append('return_payment_method', returnPaymentMethod)
    data.append('return_payment_date', returnPaymentDate?.format("YYYY-MM-DD") ?? "")
    if (document.length) {
      data.append('document', document[0])
    }
    data.append('collateral_audit', collateralAudit)
    data.append('return_audit', returnAudit)
    collateralItems.forEach((el, idx) => {
      data.append(`items[${idx}][tube_content_type]`, el.tube_content_type?.value ?? "")
      data.append(`items[${idx}][klep_condition]`, el.klep_condition ?? "")
      data.append(`items[${idx}][tube_cap]`, el.tube_cap ?? "")
      data.append(`items[${idx}][tube_quantity]`, el.tube_quantity ?? "")
      data.append(`items[${idx}][nominal]`, el.nominal ?? "")
    });

    axios.post(ApiEndpoint.COLLATERAL, data)
    .then(() => {
      navigate('/jaminan')
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
    if (!checkPermission([], ['create-collateral'])) {
      navigate('/404')
    } else {
      getSiteOptions()
      getMemberOptions()
      getContentTypeOptions()
    }
  }, [])

  const add = () => {
    setCollateralItems(prev => [...prev, {
      id: crypto.randomUUID(),
      klep_condition: null,
      nominal: "0",
      tube_cap: null,
      tube_content_type: null,
      tube_quantity: "1"
    }])
  }

  const remove = (id: string) => {
    setCollateralItems(collateralItems.filter(el => el.id !== id))
  }

  return (
    <Grid container spacing={5} className="w-full" size={12}>
      <Grid size={12} container spacing={2.5}>
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Tambah Jaminan
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
              <Grid container columnSpacing={4}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl variant="standard" fullWidth className="outlined">
                    <FormLabel component="label">Tanggal *</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disableFuture
                        disabled={isLoading}
                        value={date}
                        format="DD/MM/YYYY"
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
                  <FormControl fullWidth size="small" variant="standard" className="outlined">
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
                  <FormControl fullWidth>
                    <FormLabel component="label">Member *</FormLabel>
                    <Autocomplete
                      size="small"
                      popupIcon={<NiChevronDownSmall />}
                      clearIcon={<NiCross />}
                      value={member}
                      options={memberOptions}
                      getOptionKey={(option) => option.value}
                      onChange={(_, val) => setMember(val ?? null)}
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
                    {errors != undefined && errors['member'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['member'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl>
                    <FormLabel>Tipe Dokumen *</FormLabel>
                    <RadioGroup
                      name="controlled-radio-buttons-group"
                      value={type}
                      onChange={(e) => setType((e.target as HTMLInputElement).value)}
                      className="mb-0 flex flex-row gap-4"
                    >
                      <FormControlLabel
                        value="collateral"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Surat Jaminan"
                        disabled={isLoading}
                      />
                      <FormControlLabel
                        value="return"
                        control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                        label="Pengembalian Jaminan"
                        disabled={isLoading}
                      />
                    </RadioGroup>
                    {errors != undefined && errors['type'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['type'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">No. Nota</FormLabel>
                    <Input value={documentNumber} placeholder="" onChange={(e: any) => setDocumentNumber(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['document_number'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['document_number'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">PIC *</FormLabel>
                    <Input value={pic} placeholder="" onChange={(e: any) => setPic(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['pic'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['pic'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Nama</FormLabel>
                    <Input value={memberName} placeholder="" onChange={(e: any) => setMemberName(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['member_name'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['member_name'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Alamat</FormLabel>
                    <Input value={memberAddress} placeholder="" onChange={(e: any) => setMemberAddress(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['member_address'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['member_address'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Status Penandatangan</FormLabel>
                    <Input value={signatoryStatus} placeholder="" onChange={(e: any) => setSignatoryStatus(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['signatory_status'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['signatory_status'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Nama Usaha</FormLabel>
                    <Input value={companyName} placeholder="" onChange={(e: any) => setCompanyName(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['company_name'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['company_name'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <FormControl className="outlined" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">No. Kontak</FormLabel>
                    <Input value={contactPerson} placeholder="" onChange={(e: any) => setContactPerson(e.target.value)} disabled={isLoading} />
                    {errors != undefined && errors['contact_person'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['contact_person'][0]}</FormLabel>}
                  </FormControl>
                </Grid>
              </Grid>
              <Grid container columnSpacing={4}>
                {type === "collateral" && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Pembayaran Jaminan</FormLabel>
                        <Input value={paymentMethod} placeholder="" onChange={(e: any) => setPaymentMethod(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['payment_method'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['payment_method'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Tanggal Pembayaran Jaminan</FormLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            disableFuture
                            disabled={isLoading}
                            value={paymentDate}
                            format="DD/MM/YYYY"
                            className="mb-0"
                            onChange={(value) => value !== null && setPaymentDate(value)}
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
                        {errors != undefined && errors['payment_date'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['payment_date'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Surat Peminjaman Perusahaan</FormLabel>
                        <Box
                          {...getRootProps({ className: "dropzone" })}
                          className="border-grey-200 hover:border-grey-500 flex min-h-22.5 flex-row flex-wrap gap-2.5 rounded-md border p-4 transition-all"
                        >
                          <input {...getInputProps()} disabled={isLoading} />
                          {document.length > 0 ? (
                            thumbs
                          ) : (
                            <Typography variant="body1" className="pointer-events-none w-full self-center text-center">
                              Pilih dokumen (.pdf)
                            </Typography>
                          )}
                        </Box>
                        {errors != undefined && errors['document'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['document'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Audit Jaminan</FormLabel>
                        <Input value={collateralAudit} placeholder="" onChange={(e: any) => setCollateralAudit(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['collateral_audit'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['collateral_audit'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                  </>
                )}
                {type === "return" && (
                  <>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Pembayaran Pengembalian</FormLabel>
                        <Input value={returnPaymentMethod} placeholder="" onChange={(e: any) => setReturnPaymentMethod(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['return_payment_method'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['return_payment_method'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Tanggal Pembayaran Pengembalian</FormLabel>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            disableFuture
                            disabled={isLoading}
                            value={returnPaymentDate}
                            format="DD/MM/YYYY"
                            className="mb-0"
                            onChange={(value) => value !== null && setReturnPaymentDate(value)}
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
                        {errors != undefined && errors['return_payment_date'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['return_payment_date'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Audit Pengembalian</FormLabel>
                        <Input value={returnAudit} placeholder="" onChange={(e: any) => setReturnAudit(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['return_audit'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['return_audit'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                  </>
                )}
              </Grid>
              <Box className="flex justify-between items-center">
                <Typography variant="h5" component="h5" className="mt-4 mb-2">
                  Jaminan
                </Typography>
                <Button
                  className="icon-only surface-standard flex-none"
                  size="medium"
                  color="primary"
                  variant="surface"
                  startIcon={<NiPlus size={"medium"} />}
                  onClick={add}
                />
              </Box>
                <Grid container columnSpacing={4}>
                  {collateralItems.map((item, index) => (
                    <Grid size={12} container className="border rounded p-2 border-grey-300 mb-2">
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl fullWidth>
                          <FormLabel component="label">Isi *</FormLabel>
                          <Autocomplete
                            size="small"
                            popupIcon={<NiChevronDownSmall />}
                            clearIcon={<NiCross />}
                            value={item.tube_content_type}
                            options={contentTypeOptions}
                            getOptionKey={(option) => option.value}
                            onChange={(_, val) => {
                              let dataToSave = collateralItems.findIndex(el => el.id === item.id)
                              let old = [...collateralItems]
                              let change = {...old[dataToSave]}
                              change.tube_content_type = contentTypeOptions.find(el => el.value === val?.value)
                              old[dataToSave] = change
                              setCollateralItems(old)
                            }}
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
                          {errors != undefined && errors[`items.${index}.tube_content_type`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`items.${index}.tube_content_type`][0]}</FormLabel>}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                          <FormLabel component="label">Kondisi Klep</FormLabel>
                          <Input
                            value={item.klep_condition}
                            placeholder=""
                            onChange={(e) => {
                              let dataToSave = collateralItems.findIndex(el => el.id == item.id)
                              let old = [...collateralItems]
                              let change = {...old[dataToSave]}
                              change.klep_condition = e.target.value
                              old[dataToSave] = change
                              setCollateralItems(old)
                            }}
                            disabled={isLoading}
                          />
                          {errors != undefined && errors[`items.${index}.klep_condition`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`items.${index}.klep_condition`][0]}</FormLabel>}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                          <FormLabel component="label">Tutup Tabung</FormLabel>
                          <Input
                            value={item.tube_cap}
                            placeholder=""
                            onChange={(e) => {
                              let dataToSave = collateralItems.findIndex(el => el.id == item.id)
                              let old = [...collateralItems]
                              let change = {...old[dataToSave]}
                              change.tube_cap = e.target.value
                              old[dataToSave] = change
                              setCollateralItems(old)
                            }}
                            disabled={isLoading}
                          />
                          {errors != undefined && errors[`items.${index}.tube_cap`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`items.${index}.tube_cap`][0]}</FormLabel>}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                          <FormLabel component="label">Qty</FormLabel>
                          <Input
                            value={item.tube_quantity}
                            placeholder=""
                            onChange={(e) => {
                              let dataToSave = collateralItems.findIndex(el => el.id == item.id)
                              let old = [...collateralItems]
                              let change = {...old[dataToSave]}
                              change.tube_quantity = e.target.value
                              old[dataToSave] = change
                              setCollateralItems(old)
                            }}
                            disabled={isLoading}
                          />
                          {errors != undefined && errors[`items.${index}.tube_quantity`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`items.${index}.tube_quantity`][0]}</FormLabel>}
                        </FormControl>
                      </Grid>
                      <Grid size={{ xs: 12, md: 4 }}>
                        <FormControl className="outlined" variant="standard" size="small" fullWidth>
                          <FormLabel component="label">Jaminan</FormLabel>
                          <Input
                            value={item.nominal}
                            placeholder=""
                            onChange={(e) => {
                              let dataToSave = collateralItems.findIndex(el => el.id == item.id)
                              let old = [...collateralItems]
                              let change = {...old[dataToSave]}
                              change.nominal = e.target.value
                              old[dataToSave] = change
                              setCollateralItems(old)
                            }}
                            disabled={isLoading}
                          />
                          {errors != undefined && errors[`items.${index}.nominal`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`items.${index}.nominal`][0]}</FormLabel>}
                        </FormControl>
                      </Grid>
                      {collateralItems.length > 1 && (
                        <Grid size={{ xs: 12, md: 4 }} className="flex items-center justify-end">
                          <Button
                            className="icon-only surface-standard flex-none"
                            size="medium"
                            color="error"
                            variant="surface"
                            startIcon={<NiBinEmpty size={"medium"} />}
                            onClick={() => remove(item.id)}
                          />
                        </Grid>
                      )}
                    </Grid>
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