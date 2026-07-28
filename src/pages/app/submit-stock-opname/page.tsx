import ApiEndpoint from "@/api/api-endpoint";
import DialogYesNo from "@/components/dialog/dialog-yes-no";
import { CheckboxSmallChecked, CheckboxSmallEmptyOutlined } from "@/icons/form/mui-checkbox";
import NiCheck from "@/icons/nexture/ni-check";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import NiPen from "@/icons/nexture/ni-pen";
import { Box, Button, Card, CardContent, Typography, Grid, Select, MenuItem, FormControl, FormLabel, FormControlLabel, Checkbox } from "@mui/material";
import axios from "axios";
import 'dayjs/locale/id'
import { useState, useEffect } from "react";

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

export default function DetailMemberTransaction() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [tubeList, setTubeList] = useState<TubeList[]>([])
  const [site, setSite] = useState<string>("")
  const [siteOptions, setSiteOptions] = useState<Site[]>([])
  const [errorsGetTubeList, setErrorGetTubeList] = useState<Record<string, string[]>>()
  const [isSubmitTubeList, setIsSubmitTubeList] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)
  const [submitData, setSubmitData] = useState<SubmitData>()

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

  const getSiteOptions = () => {
    axios.get(ApiEndpoint.SITE_ALL)
    .then(res => {
      setSiteOptions(res?.data?.data)
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
    setSubmitData({ site: site, tubes: tubeList.map(item => ({ original_data: item, id: item.id, is_match: undefined, adjust: undefined, tube_status: undefined, position: undefined, position_id: undefined, supplier_transaction_type: undefined }))})
  }, [tubeList])

  useEffect(() => {
    getSiteOptions()
  }, [])

  const doEditSite = () => {
    setDialogOpen(true)
  }

  const editSite = () => {
    setTubeList([])
    setIsSubmitTubeList(false)
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
    }
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
                    // onClick={save}
                  >Simpan</Button>
                </Box>
              </Box>
              <Box className="flex flex-col divide-y divide-grey-100">
                {submitData?.tubes.map(item => (
                  <Box className="flex flex-col">
                    <Box key={crypto.randomUUID()} className="grid lg:grid-cols-7 md:grid-cols-3 grid-cols-2 py-2 gap-y-4">
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
                        <Typography className="text-success">Sesuai</Typography>
                        <FormControl>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={item.is_match ?? undefined}
                                icon={<CheckboxSmallEmptyOutlined />}
                                checkedIcon={<CheckboxSmallChecked />}
                                size="small"
                                slotProps={{
                                  input: { 'aria-label': 'controlled' },
                                }}
                                onChange={(e) => {
                                  let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                  let old = [...submitData.tubes]
                                  let change = {...old[dataToSave]}
                                  change.is_match = e.target.checked
                                  if (e.target.checked) {
                                    change.adjust = false
                                    change.position = undefined
                                    change.position_id = undefined
                                    change.supplier_transaction_type = undefined
                                    change.tube_status = undefined
                                  }
                                  old[dataToSave] = change
                                  setSubmitData({ site: submitData.site, tubes: old })
                                }}
                                disabled={isLoading}
                              />
                            }
                            label=""
                          />
                          {/* {errors != undefined && errors['active'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['active'][0]}</FormLabel>} */}
                        </FormControl>
                      </Box>
                      {item.is_match === false && (
                        <Box className="flex flex-col">
                          <Typography className="text-success">Sesuaikan</Typography>
                          <FormControl>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={item.adjust ?? undefined}
                                  icon={<CheckboxSmallEmptyOutlined />}
                                  checkedIcon={<CheckboxSmallChecked />}
                                  size="small"
                                  slotProps={{
                                    input: { 'aria-label': 'controlled' },
                                  }}
                                  onChange={(e) => {
                                    let dataToSave = submitData.tubes.findIndex(el => el.id == item.id)
                                    let old = [...submitData.tubes]
                                    let change = {...old[dataToSave]}
                                    change.adjust = e.target.checked
                                    old[dataToSave] = change
                                    setSubmitData({ site: submitData.site, tubes: old })
                                  }}
                                  disabled={isLoading}
                                />
                              }
                              label=""
                            />
                            {/* {errors != undefined && errors['active'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['active'][0]}</FormLabel>} */}
                          </FormControl>
                        </Box>
                      )}
                    </Box>
                    {item.adjust === true && (
                      <Box className="flex flex-col mb-4">
                        <Typography variant="h6" className="mb-2">Penyesuaian</Typography>
                        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
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
                          </FormControl>
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
                          </FormControl>
                          {item.position == "site" && (
                            <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                              <FormLabel component="label">Lokasi</FormLabel>
                              <Select
                                value={item.position_id}
                                label="Lokasi"
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
