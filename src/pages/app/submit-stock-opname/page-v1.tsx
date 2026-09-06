import ApiEndpoint from "@/api/api-endpoint";
import DialogYesNo from "@/components/dialog/dialog-yes-no";
import { useUserContext } from "@/hooks/use-user";
import { RadiobuttonSmallChecked, RadiobuttonSmallEmptyOutlined } from "@/icons/form/mui-radiobutton";
import NiCheck from "@/icons/nexture/ni-check";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiPen from "@/icons/nexture/ni-pen";
import { Box, Button, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl, FormLabel, FormControlLabel, Alert, Radio, RadioGroup } from "@mui/material";
import axios from "axios";
import 'dayjs/locale/id'
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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

interface SubmitData {
  site: string
  tubes: TubeSubmit[]
};

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
  const [tubeList, setTubeList] = useState<TubeList[]>([])
  const [site, setSite] = useState<string>("")
  const [siteOptions, setSiteOptions] = useState<Site[]>([])
  const [memberOptions, setMemberOptions] = useState<Member[]>([])
  const [supplierOptions, setSupplierOptions] = useState<Supplier[]>([])
  const [errorsGetTubeList, setErrorGetTubeList] = useState<Record<string, string[]>>({})
  const [isSubmitTubeList, setIsSubmitTubeList] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [submitData, setSubmitData] = useState<SubmitData>()
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

  const supplierTransactioType = [
    {
      label: "Isi Ulang",
      value: "refill"
    },
    {
      label: "Kembali Isi Ulang",
      value: "filled"
    },
    {
      label: "Perbaikan",
      value: "fixing"
    },
    {
      label: "Kembali Perbaikan",
      value: "fixed"
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

  const getTubeList = () => {
    setErrorGetTubeList({})
    setIsLoading(true)
    axios.post(ApiEndpoint.STOCK_OPNAME_TUBE_LIST, { site })
    .then(res => {
      setIsSubmitTubeList(true)
      setTubeList(res?.data?.data)
    })
    .catch(err => {
      setIsSubmitTubeList(false)
      let errData = err?.response?.data
      setErrorGetTubeList(errData?.errors);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    setSubmitData({ site: site, tubes: tubeList.map(item => ({ original_data: item, id: item.id, is_match: undefined, adjust: false, tube_status: undefined, position: undefined, position_id: undefined, supplier_transaction_type: undefined }))})
  }, [tubeList])

  useEffect(() => {
    if (!checkPermission([], ['create-stock-opname'])) {
      navigate('/404')
    } else {
      getSiteOptions()
      getMemberOptions()
      getSupplierOptions()
    }
  }, [])

  const doEditSite = () => {
    setDialogOpen(true)
  }

  const editSite = () => {
    setTubeList([])
    setIsSubmitTubeList(false)
    setErrorMessage("")
    setErrors({})
  }

  const getPositionName = (position: string) => {
    switch (position) {
      case "site":
        return "Cabang"
      case "supplier":
        return "Supplier"
      case "transit":
        return "Transit"
      case "member":
        return "Member"
      default:
        return "Tidak diketahui"
    }
  }

  const getTubeStatusName = (tubeStatus: string) => {
    switch (tubeStatus) {
      case "filled":
        return "Isi"
      case "empty":
        return "Kosong"
      case "broken":
        return "Rusak"
      case "expired":
        return "Afkir"
      case "display":
        return "Pajangan"
      default:
        return "Tidak diketahui"
    }
  }

  const save = () => {
    setIsLoading(true)
    const dataToSubmit = {
      site: submitData?.site,
      tubes: submitData?.tubes.map(item => ({
        id: item.id,
        is_match: item.is_match != undefined ? item.is_match ? 1 : 0 : undefined,
        adjust: item.adjust != undefined ? item.adjust ? 1 : 0 : undefined,
        tube_status: item.tube_status,
        position: item.position,
        position_id: item.position_id,
        supplier_transaction_type: item.supplier_transaction_type
      }))
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
      <DialogYesNo setOpen={setDialogOpen} open={dialogOpen} onConfirm={editSite} title="Ubah" message="Yakin ingin mengubah?" />
      <Grid size={12}>
        <Box className="flex items-center gap-5">
          <Typography variant="h1" component="h1" className="mb-0">
            Submit Stock Opname
          </Typography>
        </Box>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Box className="flex flex-row gap-2 items-end">
              <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                <FormLabel component="label">Cabang *</FormLabel>
                <Select
                  value={site}
                  label="Cabang"
                  onChange={(e: any) => setSite(e.target.value)}
                  IconComponent={NiChevronDownSmall}
                  MenuProps={{ className: "outlined" }}
                  disabled={isLoading || isSubmitTubeList}
                >
                  {siteOptions.map((item: any, idx: any) => (
                    <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              {!isSubmitTubeList && (
                <Button
                  size="large"
                  startIcon={<NiCheck />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="outlined"
                  color="primary"
                  onClick={getTubeList}
                >OK</Button>
              )}
              {isSubmitTubeList && (
                <Button
                  size="large"
                  startIcon={<NiPen />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="outlined"
                  color="warning"
                  onClick={doEditSite}
                >Ubah</Button>
              )}
            </Box>
            {errorsGetTubeList != undefined && errorsGetTubeList['site'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errorsGetTubeList['site'][0]}</FormLabel>}
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
      {tubeList.length > 0 && (
        <Grid size={12}>
          <Card>
            <CardContent>
              <Box className="flex justify-between items-center mb-4">
                <Typography variant="h4">
                  Daftar Tabung
                </Typography>
                <Box className="flex gap-1 items-center">
                  {/* <FormControl className="outlined mb-0" variant="standard" size="small">
                    <Input value={search} placeholder="Cari nomor/barcode" onChange={(e: any) => setSearch(e.target.value)} disabled={isLoading} />
                  </FormControl> */}
                  <Button
                    size="large"
                    startIcon={<NiFloppyDisk />}
                    loading={isLoading}
                    loadingPosition="start"
                    variant="pastel"
                    color="primary"
                    onClick={save}
                  >Simpan</Button>
                </Box>
              </Box>
              <Box className="flex flex-col divide-y divide-grey-100">
                {submitData?.tubes.map((item, key) => (
                  <Box className="flex flex-col">
                    <Box key={crypto.randomUUID()} className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-2 py-2 gap-y-4">
                      <Box className="flex flex-col">
                        <Typography className="text-secondary">Nomor Tabung</Typography>
                        <Typography>{item.original_data.number}</Typography>
                      </Box>
                      <Box className="flex flex-col">
                        <Typography className="text-secondary">Barcode</Typography>
                        <Typography>{item.original_data.barcode}</Typography>
                      </Box>
                      <Box className="flex flex-col">
                        <Typography className="text-secondary">Tabung DM</Typography>
                        {item.original_data.own ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
                      </Box>
                      <Box className="flex flex-col">
                        <Typography className="text-secondary">Posisi Tabung</Typography>
                        <Typography>{getPositionName(item.original_data.position)}</Typography>
                      </Box>
                      <Box className="flex flex-col">
                        <Typography className="text-secondary">Kondisi Tabung</Typography>
                        <Typography>{getTubeStatusName(item.original_data.tube_status)}</Typography>
                      </Box>
                      <Box className="flex flex-col">
                        <Typography className="text-success">Sesuai?</Typography>
                        <Box className="flex mt-1">
                          <FormControl>
                            <RadioGroup
                              name="controlled-radio-buttons-group"
                              value={item.is_match != undefined ? item.is_match ? "yes" : "no" : undefined}
                              onChange={(e) => {
                                let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                let old = [...submitData.tubes]
                                let change = {...old[dataToSave]}
                                change.is_match = (e.target as HTMLInputElement).value == "yes" ? true : false
                                if ((e.target as HTMLInputElement).value == "yes") {
                                  change.adjust = false
                                  change.position = undefined
                                  change.position_id = undefined
                                  change.supplier_transaction_type = undefined
                                  change.tube_status = undefined
                                }
                                old[dataToSave] = change
                                setSubmitData({ site: submitData.site, tubes: old })
                              }}
                              className="mb-0 flex flex-row gap-4"
                            >
                              <FormControlLabel
                                value="yes"
                                control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                                label="Ya"
                                disabled={isLoading}
                              />
                              <FormControlLabel
                                value="no"
                                control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                                label="Tidak"
                                disabled={isLoading}
                              />
                            </RadioGroup>
                            {errors != undefined && errors[`tubes.${key}.is_match`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.is_match`][0]}</FormLabel>}
                          </FormControl>
                        </Box>
                      </Box>
                      {item.is_match === false && (
                        <Box className="flex flex-col">
                          <Typography className="text-success">Sesuaikan?</Typography>
                          <Box className="flex mt-1">
                            <FormControl>
                              <RadioGroup
                                name="controlled-radio-buttons-group"
                                value={item.adjust != undefined ? item.adjust ? "yes" : "no" : undefined}
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.adjust = (e.target as HTMLInputElement).value == "yes" ? true : false
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                className="mb-0 flex flex-row gap-4"
                              >
                                <FormControlLabel
                                  value="yes"
                                  control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                                  label="Ya"
                                  disabled={isLoading}
                                />
                                <FormControlLabel
                                  value="no"
                                  control={<Radio icon={<RadiobuttonSmallEmptyOutlined />} checkedIcon={<RadiobuttonSmallChecked />} />}
                                  label="Tidak"
                                  disabled={isLoading}
                                />
                              </RadioGroup>
                              {errors != undefined && errors[`tubes.${key}.adjust`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.adjust`][0]}</FormLabel>}
                            </FormControl>
                          </Box>
                        </Box>
                      )}
                    </Box>
                    {item.adjust === true && (
                      <Box className="flex flex-col mb-4">
                        <Typography variant="h6" className="mb-2">Penyesuaian</Typography>
                        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                          <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                            <FormLabel component="label">Posisi Tabung</FormLabel>
                            <Select
                              value={item.position}
                              label="Posisi Tabung"
                              onChange={(e) => {
                                let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                let old = [...submitData.tubes]
                                let change = {...old[dataToSave]}
                                change.position = e.target.value
                                change.position_id = undefined
                                old[dataToSave] = change
                                setSubmitData({ site: submitData.site, tubes: old })
                              }}
                              IconComponent={NiChevronDownSmall}
                              MenuProps={{ className: "outlined" }}
                              disabled={isLoading}
                            >
                              {positionOptions.map(item => (
                                <MenuItem key={crypto.randomUUID()} value={item.value}>{item?.label}</MenuItem>
                              ))}
                            </Select>
                            {errors != undefined && errors[`tubes.${key}.position`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.position`][0]}</FormLabel>}
                          </FormControl>
                          {item.position == "site" && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Cabang</FormLabel>
                              <Select
                                value={item.position_id}
                                label="Cabang"
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.position_id = e.target.value
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                IconComponent={NiChevronDownSmall}
                                MenuProps={{ className: "outlined" }}
                                disabled={isLoading}
                              >
                                {siteOptions.map(item => (
                                  <MenuItem key={crypto.randomUUID()} value={item.id}>{item?.name}</MenuItem>
                                ))}
                              </Select>
                              {errors != undefined && errors[`tubes.${key}.position_id`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.position_id`][0]}</FormLabel>}
                            </FormControl>
                          )}
                          {item.position == "supplier" && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Supplier</FormLabel>
                              <Select
                                value={item.position_id}
                                label="Supplier"
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.position_id = e.target.value
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                IconComponent={NiChevronDownSmall}
                                MenuProps={{ className: "outlined" }}
                                disabled={isLoading}
                              >
                                {supplierOptions.map(item => (
                                  <MenuItem key={crypto.randomUUID()} value={item.id}>{item.code} - {item.name}</MenuItem>
                                ))}
                              </Select>
                              {errors != undefined && errors[`tubes.${key}.position_id`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.position_id`][0]}</FormLabel>}
                            </FormControl>
                          )}
                          {item.position == "member" && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Member</FormLabel>
                              <Select
                                value={item.position_id}
                                label="Member"
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.position_id = e.target.value
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                IconComponent={NiChevronDownSmall}
                                MenuProps={{ className: "outlined" }}
                                disabled={isLoading}
                              >
                                {memberOptions.map(item => (
                                  <MenuItem key={crypto.randomUUID()} value={item.id}>{item.code} - {item.name}</MenuItem>
                                ))}
                              </Select>
                              {errors != undefined && errors[`tubes.${key}.position_id`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.position_id`][0]}</FormLabel>}
                            </FormControl>
                          )}
                          {item.position == "supplier" && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Jenis Transaksi Supplier</FormLabel>
                              <Select
                                value={item.supplier_transaction_type}
                                label="Transaksi Supplier"
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.supplier_transaction_type = e.target.value
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                IconComponent={NiChevronDownSmall}
                                MenuProps={{ className: "outlined" }}
                                disabled={isLoading}
                              >
                                {supplierTransactioType.map(item => (
                                  <MenuItem key={crypto.randomUUID()} value={item.value}>{item.label}</MenuItem>
                                ))}
                              </Select>
                              {errors != undefined && errors[`tubes.${key}.supplier_transaction_type`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.supplier_transaction_type`][0]}</FormLabel>}
                            </FormControl>
                          )}
                          {(item.supplier_transaction_type == 'fixed' || item.position != "supplier") && item.position != undefined && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Kondisi Tabung</FormLabel>
                              <Select
                                value={item.tube_status}
                                label="Kondisi Tabung"
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.tube_status = e.target.value
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                IconComponent={NiChevronDownSmall}
                                MenuProps={{ className: "outlined" }}
                                disabled={isLoading}
                              >
                                {tubeStatusOptions.map(item => (
                                  <MenuItem key={crypto.randomUUID()} value={item.value}>{item?.label}</MenuItem>
                                ))}
                              </Select>
                              {errors != undefined && errors[`tubes.${key}.tube_status`] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors[`tubes.${key}.tube_status`][0]}</FormLabel>}
                            </FormControl>
                          )}
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}
