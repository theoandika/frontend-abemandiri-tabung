import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Collapse,
  FilledInput,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  Select,
  SelectProps,
  Tooltip,
  Typography
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowSelectionModel,
  GridRowSpacingParams,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar
} from "@mui/x-data-grid";

import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiSearch from "@/icons/nexture/ni-search";
import { cn } from "@/lib/utils";
import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import 'dayjs/locale/id'
import axios from "@/api/axios";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import { db } from "@/db";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import { GridRenderCellParams } from "@mui/x-data-grid";
import NiRefresh from "@/icons/nexture/ni-refresh";
import UpdateDraft from "./ubah";

interface Row {
  id: string;
  date: string;
  site: {
    id: string
    name: string
  };
  member: {
    label: string;
    value: string;
  } | null;
  transaction_type: string;
  tube_status: string;
  note: string;
  nominal: string;
  document?: File | null;
  barcodes: {
    id: string;
    value: string;
  }[];
  created_at: string;
  error: boolean;
};

export default function Page() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  const [rows, setRows] = useState<Row[]>([]);
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [errors, setErrors] = useState<{ id: string, message: string, data?: { barcode: string, message: string }[], errors?: Record<string, string[]> }[]>([])
  const [activeData, setActiveData] = useState<Row | null>()

  const getRows = () => {
    setIsLoading(true)
    db.memberTransactions.toArray()
    .then(data => {
      let result = data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setRows(result.map(item => ({ ...item, error: false })))
    })
    .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    getRows()
  }, [])

  const doDelete = (id: string | undefined) => {
    if (id) {
      setDeleteId(id)
      setDeleteDialogOpen(true)
    }
  }

  const deleteRow = () => {
    setIsLoading(true)
    db.memberTransactions.delete(deleteId)
    .then (() => {
      getRows()
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoading(false))
  }

  const serverSync = () => {
    setIsLoading(true)
    rows.forEach(row => {
      const data = new FormData();
      data.append('site', row.site?.id);
      data.append('member', row.member?.value ?? "")
      data.append('date', dayjs(row?.date).format("YYYY-MM-DD hh:mm"))
      data.append('transaction_type', row?.transaction_type)
      data.append('tube_status', row?.tube_status)
      data.append('note', row?.note)
      data.append('nominal', row?.nominal)
      if (row.document) {
        data.append('document', row.document)
      }
      row.barcodes.map((item) => {
        data.append('barcodes[]', item.value)
      })
  
      axios.post(ApiEndpoint.CREATE_MEMBER_TRANSACTION, data)
      .then(() => {
        navigate('/transaksi-member')
      })
      .catch((err) => {
        if (err.message === 'Network Error' || !err.response && err === undefined) {
          setErrorMessage("Anda sedang offline. Tidak dapat menyimpan ke server")
        } else {
          let update = rows.findIndex(el => el.id == row.id)
          let old = [...rows]
          let change = {...old[update]}
          change.error = true
          old[update] = change
          setRows(old)

          let errData = err?.response?.data
          setErrors(prev => [...prev, { ...errData, id: row.id }])
        }
      })
    })
    setIsLoading(false)
  }

  const doUpdate = (data: Row) => {
    setActiveData(data)
  }

  const doBack = () => {
    setActiveData(null)
    getRows()
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      width: 180,
      editable: false,
      type: "dateTime",
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY HH:mm")
    },
    {
      field: "site",
      headerName: "Cabang",
      width: 200,
      editable: false,
      valueGetter: (_, row) => row.site?.name,
    },
    {
      field: "member",
      headerName: "Member",
      width: 200,
      editable: false,
      valueGetter: (_, row) => row.member?.label,
    },
    {
      field: "transaction_type",
      headerName: "Masuk/Keluar",
      width: 100,
      editable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "in", label: 'Masuk' },
        { value: "out", label: 'Keluar' },
        { value: "return", label: 'Retur' },
        { value: "sell", label: 'Jual' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "in":
            return "Masuk";
          case "out":
            return "Keluar";
          case "return":
            return "Retur";
          case "sell":
            return "Jual";
          default:
            return "";
        }
      },
    },
    {
      field: "tube_status",
      headerName: "Kondisi",
      width: 100,
      editable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "filled", label: 'Isi' },
        { value: "empty", label: 'Kosong' },
        { value: "broken", label: 'Rusak' },
        { value: "expired", label: 'Afkir' },
        { value: "display", label: 'Pajangan' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "filled":
            return "Isi";
          case "empty":
            return "Kosong";
          case "broken":
            return "Rusak";
          case "expired":
            return "Afkir";
          case "display":
            return "Pajangan";
          default:
            return "";
        }
      },
    },
    {
      field: "items",
      headerName: "Tabung",
      editable: false,
      width: 80,
      type: "number",
      valueGetter: (_, row) => row.barcodes.length,
    },
    {
      field: "error",
      headerName: "Gagal",
      editable: false,
      width: 80,
      type: "boolean",
      renderCell: (params: GridRenderCellParams<any, boolean>) => {
        const value = params.value;
        return value ? <NiCrossSquare className="text-error" /> : <></>
      },
    },
    {
      field: "actions",
      headerName: "Aksi",
      type: "actions",
      minWidth: 80,
      flex: 1,
      align: "right",
      headerAlign: "right",
      getActions: (params) => [
        <GridActionsCellItem
          key={0}
          icon={<NiPenSquare size="medium" />}
          label="Ubah dan Simpan"
          onClick={() => doUpdate(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          key={0}
          icon={<NiCrossSquare size="medium" />}
          label="Hapus"
          onClick={() => doDelete(params.row.id)}
          showInMenu
        />,
      ],
    },
  ];

  function CustomToolbar() {
    return (
      <Toolbar className="min-h-auto border-none">
        <Grid container spacing={5} className="mb-4 w-full">
          <Grid container spacing={2.5} className="w-full" size={12}>
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Draft Transaksi
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
              <Tooltip title="Columns">
                <ColumnsPanelTrigger
                  render={(props) => (
                    <Button
                      {...props}
                      className="icon-only surface-standard flex-none"
                      size="medium"
                      color="grey"
                      variant="surface"
                    >
                      <NiCols size={"medium"} />
                    </Button>
                  )}
                />
              </Tooltip>
              <Tooltip title="Sync ke Server">
                <Button
                  className="icon-only surface-standard"
                  size="medium"
                  color="grey"
                  variant="surface"
                  startIcon={<NiRefresh size={"medium"} />}
                  onClick={serverSync}
                />
              </Tooltip>
            </Grid>
          </Grid>

          {errorMessage && (
            <Grid size={12}>
              <Collapse in={true}>
                <Alert color="error" icon={<NiCrossSquare />} >
                  {errorMessage}
                </Alert>
              </Collapse>
            </Grid>
          )}

          {errors.length > 0 && (
            errors.map(error => (
              <Grid size={12}>
                <Collapse in={true}>
                  <Alert color="error" icon={<NiCrossSquare />} >
                    <Box className="flex flex-col gap-2">
                      <Typography>ID: {error.id}</Typography>
                      <Typography>{error?.message}</Typography>
                      <Grid container>
                        {error?.errors && (
                          <>
                            {error.errors['site'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Cabang:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['site'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['member'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Member:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['member'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['transaction_type'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Jenis Transaksi:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['transaction_type'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['tube_status'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Kondisi Tabung:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['tube_status'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['note'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Catatan:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['note'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['nominal'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Nominal Jaminan:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['nominal'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['document'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Dokumen Jaminan:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['document'][0]}
                                </Grid>
                              </>
                            )}
                            {error.errors['barcodes'] && (
                              <>
                                <Grid size={{ xs: 6, md: 4 }}>
                                  Tabung:
                                </Grid>
                                <Grid size={{ xs: 6, md: 8 }}>
                                  {error.errors['barcodes'][0]}
                                </Grid>
                              </>
                            )}
                          </>
                        )}
                        {error?.data && (
                          error.data.map(errBarcode => (
                            <>
                              <Grid size={{ xs: 6, md: 4 }}>
                                {errBarcode.barcode}:
                              </Grid>
                              <Grid size={{ xs: 6, md: 8 }}>
                                {errBarcode.message}
                              </Grid>
                            </>
                          ))
                        )}
                      </Grid>
                    </Box>
                  </Alert>
                </Collapse>
              </Grid>
            ))
          )}

          <Grid container spacing={5} className="w-full" size={12}>
            <FormControl variant="filled" size="medium" className="surface mb-0 flex-1">
              <InputLabel>Cari</InputLabel>
              <QuickFilter
                render={() => (
                  <QuickFilterControl
                    render={({ ref, ...controlProps }, state) => (
                      <FilledInput
                        {...controlProps}
                        inputRef={ref}
                        endAdornment={
                          <>
                            <InputAdornment position="end" className={cn(state.value === "" && "hidden")}>
                              <QuickFilterClear edge="end">
                                <NiCross size="medium" className="text-text-disabled" />
                              </QuickFilterClear>
                            </InputAdornment>
                            <InputAdornment position="end" className={cn(state.value !== "" && "hidden")}>
                              <IconButton edge="end">
                                {<NiSearch size="medium" className="text-text-disabled" />}
                              </IconButton>
                            </InputAdornment>
                          </>
                        }
                      />
                    )}
                  />
                )}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Toolbar>
    );
  }

  if (activeData) return <UpdateDraft onBack={doBack} data={activeData} />

  return (
    <Grid container spacing={5}>
      <DeleteConfirmation setOpen={setDeleteDialogOpen} open={deleteDialogOpen} onConfirm={deleteRow} />
      <Grid size={12}>
        <DataGrid
          loading={isLoading}
          rows={rows}
          columns={columns}
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
            // basePagination: DataGridPaginationFullPage,
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
            toolbar: CustomToolbar,
          }}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel) => {
            setRowSelectionModel(rowSelectionModel);
          }}
          hideFooterSelectedRowCount
          showToolbar
        />
      </Grid>
    </Grid>
  );
}