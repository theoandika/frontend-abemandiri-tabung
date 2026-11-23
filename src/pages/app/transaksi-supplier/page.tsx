import { ChangeEvent, useCallback, useEffect, useState } from "react";

import {
  Alert,
  Autocomplete,
  Button,
  Card,
  CardContent,
  Collapse,
  FormControl,
  FormLabel,
  Grid,
  Input,
  InputLabel,
  MenuItem,
  Pagination,
  PaginationItem,
  Select,
  SelectProps,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRowSelectionModel,
  GridRowSpacingParams,
  useGridApiRef,
} from "@mui/x-data-grid";

import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
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
import NiPlus from "@/icons/nexture/ni-plus";
import NiSearch from "@/icons/nexture/ni-search";
import { cn } from "@/lib/utils";
import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/id'
import axios from "@/api/axios";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import DetailSupplierTransaction from "./detail";
import { useUserContext } from "@/hooks/use-user";
import * as XLSX from 'xlsx';
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NiCalendar from "@/icons/nexture/ni-calendar";
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";

interface Row {
  id: string
  site: {
    id: string
    name: string
  }
  supplier: {
    id: string
    code: string
    name: string
  },
  date: string
  transaction_type: "refill" | "filled" | "fixing" | "fixed"
  tube_status: "filled" | "empty" | "broken"
  note: string
  items: {
    id: string
    number: string
    barcode: string
    tube_content_type: {
      id: string
      code: string
      name: string
    }
    tube_owner: "DM" | "Non DM"
  }[]
};

interface FilterDataType {
  search:  string
  paginate: number
  date: Dayjs | null
  site: string
  refill_or_fix: string
  condition: string
  page: number
}

interface MetaDataType {
  current_page: number
  from: number
  last_page: number
  links: {
    url: string
    label: string
    page: number
    active: boolean
  }[]
  path: string
  per_page: number
  to: number
  total: number
}

interface DataExport {
  id: string
  date: string
  transaction_type: string
  tube_status: string
  site_name: string
  supplier_code: string
  supplier_name: string
  transaction_items_count: number
}

export default function Page() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  const apiRef = useGridApiRef();
  const { checkPermission } = useUserContext()
  const [rows, setRows] = useState<Row[]>([]);
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [activeData, setActiveData] = useState<Row | null>()
  const [filter, setFilter] = useState<FilterDataType>({
    search: "",
    paginate: 10,
    date: null,
    site: "",
    refill_or_fix: "",
    condition: "",
    page: 1
  })
  const [siteFilter, setSiteFilter] = useState([])
  const [supplierFilter, setSupplierFilter] = useState([])
  const [supplierFilterValue, setSupplierFilterValue] = useState<{value: string, label: string} | null>(null)
  const [meta, setMeta] = useState<MetaDataType>()
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)

  const getRows = (page?: number, paginate?: number) => {
    setIsLoading(true)
    axios.post(ApiEndpoint.SUPPLIER_TRANSACTION_INDEX, {
      ...filter,
      date: filter.date?.format("YYYY-MM-DD"),
      supplier: supplierFilterValue?.value,
      page: page ?? filter.page,
      paginate: paginate ?? filter.paginate
    })
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
      setMeta(res?.data?.meta)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getSiteFilter = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SITE_ALL)
    .then((res) => {
      setSiteFilter(res.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  const getSupplierFilter = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.SUPPLIER)
    .then((res) => {
      setSupplierFilter(res.data?.data?.map((item: any) => ({ value: item?.id, label: `${item?.code} - ${item?.name}`})))
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-supplier-transaction'])) {
      navigate('/404')
    } else {
      getRows()
      getSiteFilter()
      getSupplierFilter()
    }
  }, [])

  const doDelete = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const doDetail = (data: Row) => {
    setActiveData(data)
  }

  const doBack = () => {
    setActiveData(null)
  }

  const deleteRow = () => {
    setIsLoading(true)
    axios.delete(ApiEndpoint.SUPPLIER_TRANSACTION + "/" + deleteId)
    .then (() => {
      getRows()
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoading(false))
  }

  const exportExcel = () => {
    setIsLoadingDownload(true)
    axios.post(ApiEndpoint.SUPPLIER_TRANSACTION_EXPORT, {
      ...filter,
      date: filter.date?.format("YYYY-MM-DD"),
      supplier: supplierFilterValue?.value,
      page: filter.page,
      paginate: filter?.paginate
    })
    .then ((res) => {
      const data: DataExport[] = res?.data?.data
      const dataExport = data.map(row => ({
        Tanggal: dayjs(row.date).locale('id').format("YYYY-MM-DD HH:mm"),
        Cabang: row.site_name,
        Supplier: `${row.supplier_code} - ${row.supplier_name}`,
        "Isi Ulang/Perbaikan": (() => {
          switch (row.transaction_type) {
            case "refill":
              return "Isi Ulang";
            case "filled":
              return "Selesai Isi Ulang";
            case "fixing":
              return "Perbaikan";
            case "fixed":
              return "Selesai Perbaikan";
            default:
              return "";
          }
        })(),
        Kondisi: (() => {
          switch (row.tube_status) {
            case "filled":
              return "Isi";
            case "empty":
              return "Kosong";
            case "broken":
              return "Rusak";
            default:
              return "";
          }
        })(),
        Tabung: row.transaction_items_count,
      }));
      const ws = XLSX.utils.json_to_sheet(dataExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Data Transaksi Supplier");
      XLSX.writeFile(wb, "data_transaksi_supplier.xlsx");
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoadingDownload(false))
  }

  const onChangePage = (_event: ChangeEvent<unknown>, value: number) => {
      setFilter(prev => ({ ...prev, page: value }))
      getRows(value)
    }
  
    const onChangePageSize = (value: number) => {
      setFilter(prev => ({ ...prev, paginate: value }))
      getRows(filter.page, value)
    }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      width: 200,
      editable: false,
      type: "dateTime",
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY H:mm")
    },
    {
      field: "site",
      headerName: "Cabang",
      width: 200,
      editable: false,
      valueGetter: (_, row) => row.site.name,
    },
    {
      field: "supplier",
      headerName: "Supplier",
      width: 200,
      editable: false,
      flex: 1,
      valueGetter: (_, row) => row.supplier ? `${row.supplier.code} - ${row.supplier.name}` : '',
    },
    {
      field: "transaction_type",
      headerName: "Isi Ulang/Perbaikan",
      width: 200,
      editable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "refill", label: 'Isi Ulang' },
        { value: "filled", label: 'Selesai Isi Ulang' },
        { value: "fixing", label: 'Perbaikan' },
        { value: "fixed", label: 'Selesai Perbaikan' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "refill":
            return "Isi Ulang";
          case "filled":
            return "Selesai Isi Ulang";
          case "fixing":
            return "Perbaikan";
          case "fixed":
            return "Selesai Perbaikan";
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
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "filled":
            return "Isi";
          case "empty":
            return "Kosong";
          case "broken":
            return "Rusak";
          default:
            return "";
        }
      },
    },
    {
      field: "item_count",
      headerName: "Tabung",
      width: 80,
      editable: false,
      type: "number",
      valueGetter: (_, row) => row.items.length,
    },
    {
      field: "actions",
      headerName: "Aksi",
      type: "actions",
      minWidth: 80,
      align: "right",
      headerAlign: "right",
      getActions: (params) => [
        <GridActionsCellItem
          key={0}
          icon={<NiEyeOpen size="medium" />}
          label="Detail"
          onClick={() => doDetail(params.row)}
          showInMenu
        />,
        checkPermission([], ['delete-supplier-transaction']) ? <GridActionsCellItem
          key={0}
          icon={<NiCrossSquare size="medium" />}
          label="Hapus"
          onClick={() => doDelete(params.row.id)}
          showInMenu
        /> : <></>,
      ],
    },
  ];

  if (activeData) return <DetailSupplierTransaction onBack={doBack} data={activeData} />

  return (
    <Grid container spacing={5}>
      <DeleteConfirmation setOpen={setDeleteDialogOpen} open={deleteDialogOpen} onConfirm={deleteRow} />
      <Grid container spacing={5} className="mb-4 w-full">
        <Grid container spacing={2.5} className="w-full" size={12}>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Typography variant="h1" component="h1" className="mb-0">
              Transaksi Supplier
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
            <Tooltip title="Download Excel">
              <Button
                className="icon-only surface-standard flex-none"
                size="medium"
                color="grey"
                variant="surface"
                startIcon={<NiArrowInDown size={"medium"} />}
                onClick={exportExcel}
                loading={isLoadingDownload}
              />
            </Tooltip>

            {checkPermission([], ['create-supplier-transaction']) && (
              <Tooltip title="Transaksi Baru">
                <Button
                  className="icon-only surface-standard"
                  size="medium"
                  color="grey"
                  variant="surface"
                  startIcon={<NiPlus size={"medium"} />}
                  onClick={() => navigate('/transaksi-supplier-baru')}
                />
              </Tooltip>
            )}
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

        <Grid size={12}>
          <Card>
            <CardContent>
              <Grid container spacing={5} className="w-full" size={12}>
                <Grid size={{xs: 1, md: 2, lg:3}}>
                  <FormControl className="outlined mb-0" variant="standard" size="small" fullWidth>
                    <FormLabel component="label">Cari</FormLabel>
                      <Input
                        placeholder="Cabang atau supplier"
                        value={filter?.search ?? ""}
                        onChange={e => setFilter(prev => ({ ...prev,  search: e.target.value}))}
                        disabled={isLoading}
                      />
                    </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl variant="standard" fullWidth className="outlined">
                    <FormLabel component="label">Tanggal</FormLabel>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        disabled={isLoading}
                        value={filter.date}
                        format="YYYY-MM-DD"
                        className="mb-0"
                        onChange={(value) => value !== null && setFilter(prev => ({...prev, date: value}))}
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
                          field: { clearable: true, onClear: () => setFilter(prev => ({ ...prev, date: null })) }
                        }}
                      />
                    </LocalizationProvider>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Cabang</FormLabel>
                    <Select
                      value={filter?.site}
                      onChange={(e: any) => setFilter(prev => ({...prev, site: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      {siteFilter.map((item: any, idx: any) => (
                        <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth>
                    <FormLabel component="label">Supplier</FormLabel>
                    <Autocomplete
                      size="small"
                      popupIcon={<NiChevronDownSmall />}
                      clearIcon={<NiCross />}
                      value={supplierFilterValue}
                      options={supplierFilter}
                      getOptionKey={(option: any) => option.value}
                      getOptionLabel={(option: any) => option.label}
                      onChange={(_, val: any) => setSupplierFilterValue(val)}
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
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Isi Ulang/Perbaikan</FormLabel>
                    <Select
                      value={filter.refill_or_fix}
                      onChange={(e: any) => setFilter(prev => ({...prev, refill_or_fix: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      <MenuItem value="refill">Isi Ulang</MenuItem>
                      <MenuItem value="filled">Selesai Isi Ulang</MenuItem>
                      <MenuItem value="fixing">Perbaikan</MenuItem>
                      <MenuItem value="fixed">Selesai Perbaikan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Kondisi</FormLabel>
                    <Select
                      value={filter?.condition}
                      onChange={(e: any) => setFilter(prev => ({...prev, condition: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      <MenuItem value="filled">Isi</MenuItem>
                      <MenuItem value="empty">Kosong</MenuItem>
                      <MenuItem value="broken">Rusak</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }} className="flex items-end">
                  <Button
                    size="small"
                    startIcon={<NiSearch />}
                    loading={isLoading}
                    loadingPosition="start"
                    variant="pastel"
                    color="primary"
                    onClick={() => getRows()}
                  >Cari</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Grid size={12}>
        <DataGrid
          apiRef={apiRef}
          loading={isLoading}
          rows={rows}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { id: false } },
          }}
          getRowSpacing={getRowSpacing}
          rowHeight={68}
          columnHeaderHeight={32}
          disableRowSelectionOnClick
          className="full-page border-none"
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
          }}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={(rowSelectionModel: GridRowSelectionModel) => {
            setRowSelectionModel(rowSelectionModel);
          }}
          showToolbar={false}
          hideFooter
        />
      </Grid>
      <Grid size={12} component="div" className="flex justify-end">
        <FormControl size="small" variant="standard" className="outlined mb-0 w-18">
          <Select
            value={filter?.paginate}
            onChange={(e: any) => onChangePageSize(e.target.value)}
            IconComponent={NiChevronDownSmall}
            MenuProps={{ className: "outlined" }}
            disabled={isLoading}
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={25}>25</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </FormControl>
        <Pagination
          size="small"
          count={meta?.last_page ?? 0}
          page={filter.page}
          onChange={onChangePage}
          renderItem={(item) => (
            <PaginationItem slots={{ previous: NiChevronLeftSmall, next: NiChevronRightSmall }} {...item} />
          )}
          color="primary"
        />
      </Grid>
    </Grid>
  );
}