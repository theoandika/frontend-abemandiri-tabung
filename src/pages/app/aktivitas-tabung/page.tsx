import { ChangeEvent, useCallback, useEffect, useState } from "react";

import {
  Alert,
  Button,
  Card,
  CardContent,
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
  Tooltip,
  Typography
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowSpacingParams,
  useGridApiRef
} from "@mui/x-data-grid";

import NiArrowDown from "@/icons/nexture/ni-arrow-down";
import NiArrowInDown from "@/icons/nexture/ni-arrow-in-down";
import NiArrowUp from "@/icons/nexture/ni-arrow-up";
import NiBinEmpty from "@/icons/nexture/ni-bin-empty";
import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import NiChevronLeftRightSmall from "@/icons/nexture/ni-chevron-left-right-small";
import NiCols from "@/icons/nexture/ni-cols";
import NiCross from "@/icons/nexture/ni-cross";
import NiEllipsisVertical from "@/icons/nexture/ni-ellipsis-vertical";
import NiEyeInactive from "@/icons/nexture/ni-eye-inactive";
import NiFilter from "@/icons/nexture/ni-filter";
import NiFilterPlus from "@/icons/nexture/ni-filter-plus";
import NiSearch from "@/icons/nexture/ni-search";
import { cn } from "@/lib/utils";
import ApiEndpoint from "@/api/api-endpoint"
import dayjs, { Dayjs } from "dayjs";
import 'dayjs/locale/id'
import axios from "@/api/axios";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { useUserContext } from "@/hooks/use-user";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';
import NiChevronLeftSmall from "@/icons/nexture/ni-chevron-left-small";
import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import NiCalendar from "@/icons/nexture/ni-calendar";

interface Row {
  id: string
  date: string
  number: string
  barcode: string
  site: {
    id: string
    name: string
  }
  content: {
    id: string
    code: string
    name: string
  }
  transaction_type: "in" | "out" | "return" | "sell" | "refill" | "filled" | "fixing" | "fixed"
  tube_status: "filled" | "empty" | "broken" | "expired" | "display"
  position: string
  position_name: string
  adjust_by_stock_opname: boolean
};

interface FilterDataType {
  search: string,
  paginate: number,
  date: Dayjs | null,
  site: string,
  content: string,
  transaction_type: string
  condition: string
  location: string
  opname_adjust: number | string
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
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [filter, setFilter] = useState<FilterDataType>({
    search: "",
    paginate: 10,
    date: null,
    site: "",
    content: "",
    transaction_type: "",
    condition: "",
    location: "",
    opname_adjust: "",
    page: 1
  })
  const [siteFilter, setSiteFilter] = useState([])
  const [contentTypeFilter, setContentTypeFilter] = useState([])
  const [meta, setMeta] = useState<MetaDataType>()
  const [isLoadingDownload, setIsLoadingDownload] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")

  const getRows = (page?: number, paginate?: number) => {
    setIsLoading(true)
    axios.post(ApiEndpoint.TUBE_ACTIVITY_REPORT, {
      ...filter,
      date: filter.date?.format("YYYY-MM-DD"),
      page: page ?? filter?.page,
      paginate: paginate ?? filter?.paginate
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

  const getContentOptions = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.TUBE_CONTENT_ALL)
    .then((res) => {
      setContentTypeFilter(res?.data?.data)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-tube-activity'])) {
      navigate('/404')
    } else {
      getRows()
      getSiteFilter()
      getContentOptions()
    }
  }, [])

  const exportExcel = () => {
    setIsLoadingDownload(true)
    axios.post(ApiEndpoint.EXPORT_TUBE_ACTIVITY, {
      ...filter,
      date: filter.date?.format("YYYY-MM-DD")
    })
    .then((res) => {
      let result = res.data?.data
      const dataExport = result.map((row: any) => {
        return {
          Tanggal: dayjs(row.date).locale('id').format("DD MMMM YYYY HH:mm"),
          Nomor: row.number,
          Barcode: row.barcode,
          Cabang: row.site_name,
          Isi: `${row.content_code} - ${row.content_name}`,
          Aktivitas: (() => {
            switch (row.transaction_type) {
              case "in":
                return "Masuk";
              case "out":
                return "Keluar";
              case "return":
                return "Retur";
              case "sell":
                return "Jual";
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
              case "expired":
                return "Afkir";
              case "display":
                return "Pajangan";
              default:
                return "";
            }
          })(),
          Lokasi: (() => {
            switch (row.position) {
              case "site":
                return "Cabang";
              case "supplier":
                return "Supplier";
              case "member":
                return "Member";
              case "transit":
                return "Transit";
              case "unknown":
                return "Tidak diketahui";
              default:
                return "";
            }
          })(),
          "Nama Lokasi": row.position_name,
          "Penyesuaian SO": row.is_adjust_by_stock_opname ? "Ya" : "Tidak",
        }
      })
      const worksheet = XLSX.utils.json_to_sheet(dataExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      XLSX.writeFile(workbook, "laporan_aktivitas_tabung.xlsx");
    })
    .catch(_err => {
      setErrorMessage("Data terlalu besar, tidak dapat diunduh. Gunakan filter untuk mengurangi data");
    })
    .finally(() => {
      setIsLoadingDownload(false)
    })
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
      width: 150,
      editable: false,
      sortable: false,
      filterable: false,
      type: "dateTime",
      flex: 1,
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY HH:mm")
    },
    {
      field: "number",
      headerName: "Nomor",
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
    },
    {
      field: "site",
      headerName: "Cabang",
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
      flex: 1,
      valueGetter: (_, row) => `${row.site.name}`,
    },
    {
      field: "content",
      headerName: "Isi",
      editable: false,
      sortable: false,
      filterable: false,
      width: 150,
      valueGetter: (_, row) => `${row.content.code} - ${row.content.name}`,
    },
    {
      field: "transaction_type",
      headerName: "Aktivitas",
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "in", label: 'Masuk' },
        { value: "out", label: 'Keluar' },
        { value: "return", label: 'Retur' },
        { value: "sell", label: 'Jual' },
        { value: "refill", label: 'Isi Ulang' },
        { value: "filled", label: 'Selesai Isi Ulang' },
        { value: "fixing", label: 'Perbaikan' },
        { value: "fixed", label: 'Selesai Perbaikan' },
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
      sortable: false,
      filterable: false,
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
      field: "position",
      headerName: "Lokasi",
      width: 100,
      editable: false,
      sortable: false,
      filterable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "site", label: 'Cabang' },
        { value: "supplier", label: 'Supplier' },
        { value: "member", label: 'Member' },
        { value: "transit", label: 'Transit' },
        { value: "unknown", label: 'Tidak diketahui' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "site":
            return "Cabang";
          case "supplier":
            return "Supplier";
          case "member":
            return "Member";
          case "transit":
            return "Transit";
          case "unknown":
            return "Tidak diketahui";
          default:
            return "";
        }
      },
    },
    {
      field: "position_name",
      headerName: "Nama Lokasi",
      editable: false,
      sortable: false,
      filterable: false,
      width: 150,
      flex: 1
    },
    {
      field: "adjust_by_stock_opname",
      headerName: "Penyesuaian SO",
      editable: false,
      sortable: false,
      filterable: false,
      width: 100,
      type: "boolean",
      renderCell: (params: GridRenderCellParams<any, boolean>) => {
        const value = params.value;
        return value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />
      },
    },
  ];

  return (
    <Grid container spacing={5}>
      <Grid container spacing={5} className="mb-4 w-full">
        <Grid container spacing={2.5} className="w-full" size={12}>
          <Grid size={{ xs: 12, md: "grow" }}>
            <Typography variant="h1" component="h1" className="mb-0">
              Laporan Aktivitas Tabung
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
          </Grid>
        </Grid>

        {errorMessage && (
          <Grid size={12}>
            <Alert color="error" icon={<NiCrossSquare />} >
              {errorMessage}
            </Alert>
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
                        placeholder="Nomor atau barcode"
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
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Isi</FormLabel>
                    <Select
                      value={filter?.content}
                      onChange={(e: any) => setFilter(prev => ({...prev, content: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      {contentTypeFilter.map((item: any, idx: any) => (
                        <MenuItem key={idx} value={item?.id}>{item?.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Aktivitas</FormLabel>
                    <Select
                      value={filter?.transaction_type}
                      onChange={(e: any) => setFilter(prev => ({...prev, transaction_type: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      <MenuItem value="in">Masuk</MenuItem>
                      <MenuItem value="out">Keluar</MenuItem>
                      <MenuItem value="return">Retur</MenuItem>
                      <MenuItem value="sell">Jual</MenuItem>
                      <MenuItem value="refill">Isi Ulang</MenuItem>
                      <MenuItem value="filled">Selesai Isi Ulang</MenuItem>
                      <MenuItem value="fixing">Perbaikan</MenuItem>
                      <MenuItem value="fixed">Selesai Perbaikan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Lokasi</FormLabel>
                    <Select
                      value={filter?.location}
                      onChange={(e: any) => setFilter(prev => ({...prev, location: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      <MenuItem value="member">Member</MenuItem>
                      <MenuItem value="site">Cabang</MenuItem>
                      <MenuItem value="supplier">Supplier</MenuItem>
                      <MenuItem value="transit">Transit</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 1, md: 2, lg:3 }}>
                  <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                    <FormLabel component="label">Penyesuaian Opname</FormLabel>
                    <Select
                      value={filter?.opname_adjust}
                      onChange={(e: any) => setFilter(prev => ({...prev, opname_adjust: e.target.value}))}
                      IconComponent={NiChevronDownSmall}
                      MenuProps={{ className: "outlined" }}
                      disabled={isLoading}
                    >
                      <MenuItem value="">Semua</MenuItem>
                      <MenuItem value={1}>Ya</MenuItem>
                      <MenuItem value={0}>Tidak</MenuItem>
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
            columns: { columnVisibilityModel: { id: false } }
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