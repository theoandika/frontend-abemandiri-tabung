import { Alert, Autocomplete, Box, Button, Card, CardContent, Collapse, FormControl, FormLabel, Grid, Input, InputLabel, Select, SelectProps, Tab, TextField, Tooltip, Typography } from '@mui/material';
import dayjs from "dayjs";
import 'dayjs/locale/id'
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { DataGrid, GridActionsCellItem, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridRowSpacingParams, useGridApiRef } from "@mui/x-data-grid";
import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiFilter from "@/icons/nexture/ni-filter";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiCross from "@/icons/nexture/ni-cross";
import NiCols from "@/icons/nexture/ni-cols";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiSearch from "@/icons/nexture/ni-search";
import NiArrowLeft from "@/icons/nexture/ni-arrow-left";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiPlus from "@/icons/nexture/ni-plus";
import TabContext from '@mui/lab/TabContext';
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import NiCamera from "@/icons/nexture/ni-camera";
import { useDropzone } from "react-dropzone";
import NiFloppyDisk from "@/icons/nexture/ni-floppy-disk";
import ScannerDialog from "@/components/dialog/scanner-dialog";
import axios from "@/api/axios";
import ApiEndpoint from "@/api/api-endpoint";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import NiDocumentImage from '@/icons/nexture/ni-document-image';

interface TubeStockOpname {
  id: string
  number: string
  barcode: string
  tube_content: {
    id: string
    code: string
    name: string
  }
  type: "medical" | "industry"
  own: boolean
  status: string
  position: string
}

interface StockOpnameItem {
  id: string
  tube: TubeStockOpname
  match: boolean
  adjust: boolean
  note: string
  photo: string
}

interface DetailStockOpname {
  id: string
  date: string
  site: {
    id: string
    name: string
  }
  content: {
    id: string
    code: string
    name: string
  }
  pic: string
  tube_status: string
  tube_count: number
  not_match_count: number
  tubes: StockOpnameItem[]
}

interface DialogProps {
	id?: string
  onBack: () => void
  isLoading: boolean
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export default function DetailStockOpname({ id, onBack, isLoading, setIsLoading }: DialogProps) {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const [data, setData] = useState<DetailStockOpname | null>(null)
  const [tabAdd, setTabAdd] = useState<string>("")
  const [barcode, setBarcode] = useState<string>("")
  const [note, setNote] = useState<string>("")
  const [supplier, setSupplier] = useState<{ id: string, code: string, name: string } | null>(null)
  const [member, setMember] = useState<{ id: string, code: string, name: string } | null>(null)
  const [memberOptions, setMemberOptions] = useState<{ id: string, code: string, name: string }[]>([])
  const [supplierOptions, setSupplierOptions] = useState<{ id: string, code: string, name: string }[]>([])
  const [scanPause, setScanPause] = useState<boolean>(true)
  const [photo, setPhoto] = useState<(any & { preview: string }[])>([]);
  const [errors, setErrors] = useState<Record<string, string[]>>()
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [deleteId, setDeleteId] = useState<string>("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)

  const getData = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.STOCK_OPNAME + "/" + id)
    .then(res => {
      setData(res?.data?.data)
    })
    .finally(() => setIsLoading(false))
  }

  const getMemberOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.MEMBER_ALL)
    .then(res => {
      setMemberOptions(res?.data?.data)
    })
    .finally(() => setIsLoading(false))
  }

  const getSupplierOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SUPPLIER)
    .then(res => {
      setSupplierOptions(res?.data?.data)
    })
    .finally(() => setIsLoading(false))
  }

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

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

  const [rows, setRows] = useState<StockOpnameItem[]>([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    data?.tubes && setRows(data?.tubes)
  }, [data])

  useEffect(() => {
    getData()
    getMemberOptions()
    getSupplierOptions()
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

  const resetForm = () => {
    setBarcode("")
    setPhoto([])
  }

  const save = () => {
    setIsLoading(true)
    const submitData = new FormData();
    submitData.append('barcode', barcode);
    submitData.append('position', tabAdd);
    submitData.append('supplier', supplier?.id ?? "");
    submitData.append('member', member?.id ?? "");
    submitData.append('note', note);
    if (photo.length > 0) {
      submitData.append('photo', photo[0])
    }
    axios.post(ApiEndpoint.STOCK_OPNAME + "/" +data?.id + "/add-item", submitData)
    .then(() => {
      getData()
      resetForm()
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

  const doDelete = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const deleteItem = () => {
    axios.delete(ApiEndpoint.STOCK_OPNAME + "/" +data?.id + "/" + deleteId)
    .then(() => {
      getData()
    })
    .catch((err) => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message);
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "tube.number",
      headerName: "Nomor",
      width: 150,
      editable: false,
      valueGetter: (_, row) => row.tube.number
    },
    {
      field: "tube.barcode",
      headerName: "Barcode",
      width: 150,
      editable: false,
      valueGetter: (_, row) => row.tube.barcode
    },
    {
      field: "tube.own",
      headerName: "Tabung DM",
      editable: false,
      type: "boolean",
      valueGetter: (_, row) => row.tube.own,
      renderCell: (params: GridRenderCellParams<any, boolean>) => {
        const value = params.value;
        return (
          <Box>
            {value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
          </Box>
        )
      },
    },
    {
      field: "tube",
      headerName: "Lokasi Tabung",
      width: 150,
      editable: false,
      valueGetter: (_, row) => {
        switch (row.tube.position) {
          case "site":
            return "Cabang"
          case "member":
            return "Member"
          case "supplier":
            return "Supplier"
          case "transit":
            return "Transit"
          default:
            return "Tidak diketahui"
        }
      }
    },
    {
      field: "note",
      headerName: "Catatan",
      editable: false,
      flex: 1
    },
    {
      field: "photo",
      headerName: "Foto",
      editable: false,
      width: 150,
      renderCell: (params: GridRenderCellParams<any, string>) => {
        const value = params.value;
        return (
          <Button
            className="surface-standard"
            size="small"
            color="info"
            variant="pastel"
            startIcon={<NiDocumentImage size={"small"} />}
            onClick={() => window.open(value ?? "", '_blank')?.focus()}
          >Lihat Foto</Button>
        )
      },
    },
    // {
    //   field: "match",
    //   headerName: "Sesuai",
    //   editable: false,
    //   type: "boolean",
    //   renderCell: (params: GridRenderCellParams<any, boolean>) => {
    //     const value = params.value;
    //     return (
    //       <Box>
    //         {value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
    //       </Box>
    //     )
    //   },
    // },
    // {
    //   field: "adjust",
    //   headerName: "Disesuaikan",
    //   editable: false,
    //   type: "boolean",
    //   renderCell: (params: GridRenderCellParams<any, boolean>) => {
    //     const value = params.value;
    //     return (
    //       <Box>
    //         {value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />}
    //       </Box>
    //     )
    //   },
    // },
    {
      field: "actions",
      headerName: "Aksi",
      type: "actions",
      minWidth: 80,
      align: "right",
      headerAlign: "right",
      getActions: (params) => [
        <GridActionsCellItem
          key={1}
          icon={<NiCrossSquare size="medium" />}
          label="Hapus"
          onClick={() => doDelete(params.row.id)}
          showInMenu
        />,
      ],
    },
  ];

	return (
    <Grid container spacing={5}>
      <DeleteConfirmation setOpen={setDeleteDialogOpen} open={deleteDialogOpen} onConfirm={deleteItem} />
      <ScannerDialog allowMultiple={true} scanPaused={scanPause} setScanPaused={setScanPause} setScanResult={setBarcode} />
      <Grid size={12}>
        <Box className="flex items-center gap-5">
          <Tooltip title="Kembali">
            <Button
              className="icon-only surface-standard flex-none"
              size="medium"
              color="grey"
              variant="surface"
              startIcon={<NiArrowLeft size={"medium"} />}
              onClick={() => onBack()}
            />
          </Tooltip>
          <Typography variant="h1" component="h1" className="mb-0">
            Stock Opname
          </Typography>
        </Box>
      </Grid>
      <Grid size={12}>
        <Card>
          <CardContent>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, md: 4}}>
                Tanggal :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {dayjs(data?.date).locale('id').format("DD MMMM YYYY HH:mm")}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Cabang :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.site.name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Isi Tabung :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.content?.code} - {data?.content?.name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                PIC Opname :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.pic}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Kondisi Tabung :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.tube_status == 'empty' && 'Kosong'}
                {data?.tube_status == 'filled' && 'Isi'}
                {data?.tube_status == 'broken' && 'Rusak'}
                {data?.tube_status == 'expired' && 'Afkir'}
                {data?.tube_status == 'display' && 'Pajangan'}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Jumlah Tabung :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.tube_count}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Tidak Sesuai :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.not_match_count}
              </Grid>
            </Grid>
            <Box className="flex gap-1 mt-4">
              {tabAdd == "" && (
                <Button
                  size="small"
                  startIcon={<NiPlus />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="pastel"
                  color="primary"
                  onClick={() => setTabAdd("site")}
                >Tambah Item</Button>
              )}
              {tabAdd != "" && (
                <Button
                  size="small"
                  startIcon={<NiCross />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="pastel"
                  color="warning"
                  onClick={() => setTabAdd("")}
                >Tutup</Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      {tabAdd != "" && (
        <Card className="w-full text-base">
          <CardContent>
            <Box>
              <TabContext value={tabAdd}>
                <Box>
                  <TabList onChange={(_, val) => setTabAdd(val)} variant="fullWidth">
                    <Tab label="Cabang" value="site" icon={<NiPlus size="medium" />} iconPosition="start" />
                    <Tab label="Member" value="member" icon={<NiPlus size="medium" />} iconPosition="start" />
                    <Tab label="Supplier" value="supplier" icon={<NiPlus size="medium" />} iconPosition="start" />
                  </TabList>
                </Box>
                {errorMessage && (
                  <Box>
                    <Collapse in={true}>
                      <Alert className="mb-2" color="error" icon={<NiCrossSquare />} >
                        {errorMessage}
                      </Alert>
                    </Collapse>
                  </Box>
                )}
                <TabPanel value="site" className="p-0">
                  <Grid container columnSpacing={5} rowSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="flex items-end gap-1">
                        <FormControl className="outlined mb-0 flex-1" variant="standard" size="small">
                          <FormLabel component="label">Barcode *</FormLabel>
                          <Input
                            value={barcode}
                            placeholder="Barcode"
                            onChange={(e) => setBarcode(e.target.value)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Button
                          className="icon-only"
                          size="large"
                          color="primary"
                          variant="contained"
                          onClick={() => setScanPause(!scanPause)}
                          startIcon={<NiCamera size={"large"} />}
                          disabled={isLoading}
                        />
                      </Box>
                      {errors != undefined && errors['barcode'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['barcode'][0]}</FormLabel>}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Catatan</FormLabel>
                        <Input value={note} placeholder="" onChange={(e: any) => setNote(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['note'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['note'][0]}</FormLabel>}
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
                  <Box className="flex justify-end">
                    <Button
                      size="small"
                      startIcon={<NiFloppyDisk />}
                      loading={isLoading}
                      loadingPosition="start"
                      variant="pastel"
                      color="primary"
                      onClick={() => save()}
                    >Tambahkan</Button>
                  </Box>
                </TabPanel>
                <TabPanel value="member" className="p-0">
                  <Grid container columnSpacing={5} rowSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="flex items-end gap-1">
                        <FormControl className="outlined mb-0 flex-1" variant="standard" size="small">
                          <FormLabel component="label">Barcode *</FormLabel>
                          <Input
                            value={barcode}
                            placeholder="Barcode"
                            onChange={(e) => setBarcode(e.target.value)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Button
                          className="icon-only"
                          size="large"
                          color="primary"
                          variant="contained"
                          onClick={() => setScanPause(!scanPause)}
                          startIcon={<NiCamera size={"large"} />}
                          disabled={isLoading}
                        />
                      </Box>
                      {errors != undefined && errors['barcode'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['barcode'][0]}</FormLabel>}
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
                          getOptionKey={(option) => option.id}
                          getOptionLabel={(option) => `${option.code} - ${option.name}`}
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
                    <Grid size={12}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Catatan</FormLabel>
                        <Input value={note} placeholder="" onChange={(e: any) => setNote(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['note'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['note'][0]}</FormLabel>}
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
                  <Box className="flex justify-end">
                    <Button
                      size="small"
                      startIcon={<NiFloppyDisk />}
                      loading={isLoading}
                      loadingPosition="start"
                      variant="pastel"
                      color="primary"
                      onClick={() => save()}
                    >Tambahkan</Button>
                  </Box>
                </TabPanel>
                <TabPanel value="supplier" className="p-0">
                  <Grid container columnSpacing={5} rowSpacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box className="flex items-end gap-1">
                        <FormControl className="outlined mb-0 flex-1" variant="standard" size="small">
                          <FormLabel component="label">Barcode *</FormLabel>
                          <Input
                            value={barcode}
                            placeholder="Barcode"
                            onChange={(e) => setBarcode(e.target.value)}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <Button
                          className="icon-only"
                          size="large"
                          color="primary"
                          variant="contained"
                          onClick={() => setScanPause(!scanPause)}
                          startIcon={<NiCamera size={"large"} />}
                          disabled={isLoading}
                        />
                      </Box>
                      {errors != undefined && errors['barcode'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['barcode'][0]}</FormLabel>}
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <FormLabel component="label">Supplier *</FormLabel>
                        <Autocomplete
                          size="small"
                          popupIcon={<NiChevronDownSmall />}
                          clearIcon={<NiCross />}
                          value={supplier}
                          options={supplierOptions}
                          getOptionKey={(option) => option.id}
                          getOptionLabel={(option) => `${option.code} - ${option.name}`}
                          onChange={(_, val) => setSupplier(val ?? null)}
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
                        {errors != undefined && errors['supplier'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['supplier'][0]}</FormLabel>}
                      </FormControl>
                    </Grid>
                    <Grid size={12}>
                      <FormControl className="outlined" variant="standard" size="small" fullWidth>
                        <FormLabel component="label">Catatan</FormLabel>
                        <Input value={note} placeholder="" onChange={(e: any) => setNote(e.target.value)} disabled={isLoading} />
                        {errors != undefined && errors['note'] && <FormLabel component="label" className="text-error! mt-0.25 text-sm!">{errors['note'][0]}</FormLabel>}
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
                  <Box className="flex justify-end">
                    <Button
                      size="small"
                      startIcon={<NiFloppyDisk />}
                      loading={isLoading}
                      loadingPosition="start"
                      variant="pastel"
                      color="primary"
                      onClick={() => save()}
                    >Tambahkan</Button>
                  </Box>
                </TabPanel>
              </TabContext>
            </Box>
          </CardContent>
        </Card>
      )}
      <Grid size={12}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          density="standard"
          initialState={{
            columns: { columnVisibilityModel: { id: false } }
          }}
          getRowSpacing={getRowSpacing}
          rowHeight={68}
          columnHeaderHeight={32}
          disableRowSelectionOnClick
          className="full-page border-none"
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
          pageSizeOptions={[5,10,25,50,100]}
          slotProps={{
            panel: {
              className: "mt-1!",
            },
            main: {
              className: "overflow-visible",
            },
          }}
          slots={{
            columnSortedDescendingIcon: () => {
              return <NiArrowDown size={"small"}></NiArrowDown>;
            },
            columnSortedAscendingIcon: () => {
              return <NiArrowUp size={"small"}></NiArrowUp>;
            },
            columnFilteredIcon: () => {
              return <NiFilterPlus size={"small"}></NiFilterPlus>;
            },
            columnReorderIcon: () => {
              return <NiChevronLeftRightSmall size={"small"}></NiChevronLeftRightSmall>;
            },
            columnMenuIcon: () => {
              return <NiEllipsisVertical size={"small"}></NiEllipsisVertical>;
            },
            columnMenuSortAscendingIcon: NiArrowUp,
            columnMenuSortDescendingIcon: NiArrowDown,
            columnMenuFilterIcon: NiFilter,
            columnMenuHideIcon: NiEyeInactive,
            columnMenuClearIcon: NiCross,
            columnMenuManageColumnsIcon: NiCols,
            filterPanelDeleteIcon: NiCross,
            filterPanelRemoveAllIcon: NiBinEmpty,
            baseSelect: (props: any) => {
              const propsCasted = props as SelectProps;
              return (
                <FormControl size="small" variant="outlined">
                  <InputLabel>{props.label}</InputLabel>
                  <Select {...propsCasted} IconComponent={NiChevronDownSmall} MenuProps={{ className: "outlined" }} />
                </FormControl>
              );
            },
            quickFilterIcon: () => {
              return <NiSearch size={"medium"} />;
            },
            quickFilterClearIcon: () => {
              return <NiCross size={"medium"} />;
            },
            baseButton: (props) => {
              return <Button {...props} variant="pastel" color="grey"></Button>;
            },
            moreActionsIcon: () => {
              return <NiEllipsisVertical size={"medium"} />;
            },
          }}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel) => {
            setRowSelectionModel(rowSelectionModel);
          }}
          hideFooterSelectedRowCount
          showToolbar={false}
        />
      </Grid>
    </Grid>
	);
}
