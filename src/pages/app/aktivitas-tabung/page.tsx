import { useCallback, useEffect, useState } from "react";

import {
  Button,
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
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowSpacingParams,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
  gridFilteredSortedRowEntriesSelector,
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
import dayjs from "dayjs";
import 'dayjs/locale/id'
import axios from "@/api/axios";
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import NiCrossSquare from "@/icons/nexture/ni-cross-square";
import { useUserContext } from "@/hooks/use-user";
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

interface Row {
  id: string
  date: string
  number: string
  barcode: string
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

  const apiRef = useGridApiRef();
  const { checkPermission } = useUserContext()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const getRows = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.TUBE_ACTIVITY_REPORT)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
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
    }
  }, [])

  const exportExcel = () => {
    const filteredSortedRowEntries = gridFilteredSortedRowEntriesSelector(apiRef);
    const filteredRows = filteredSortedRowEntries.map(entry => entry.model);
    const dataExport = filteredRows.map((row) => {
      return {
        Tanggal: dayjs(row.date).locale('id').format("DD MMMM YYYY HH:mm"),
        Nomor: row.number,
        Barcode: row.barcode,
        Isi: `${row.content.code} - ${row.content.name}`,
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
        Posisi: (() => {
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
        "Nama Posisi": row.position_name,
        "Penyesuaian SO": row.adjust_by_stock_opname ? "Ya" : "Tidak",
      }
    })
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "laporan_aktivitas_tabung.xlsx");
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      width: 150,
      editable: false,
      type: "dateTime",
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY HH:mm")
    },
    {
      field: "number",
      headerName: "Nomor",
      width: 100,
      editable: false,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      width: 100,
      editable: false,
    },
    {
      field: "content",
      headerName: "Isi",
      editable: false,
      width: 150,
      valueGetter: (_, row) => `${row.content.code} - ${row.content.name}`,
    },
    {
      field: "transaction_type",
      headerName: "Aktivitas",
      width: 100,
      editable: false,
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
      headerName: "Posisi",
      width: 100,
      editable: false,
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
      headerName: "Nama Posisi",
      editable: false,
      width: 150,
    },
    {
      field: "adjust_by_stock_opname",
      headerName: "Penyesuaian SO",
      editable: false,
      width: 100,
      type: "boolean",
      renderCell: (params: GridRenderCellParams<any, boolean>) => {
        const value = params.value;
        return value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />
      },
    },
  ];

  function CustomToolbar() {
    return (
      <Toolbar className="min-h-auto border-none">
        <Grid container spacing={5} className="mb-4 w-full">
          <Grid container spacing={2.5} className="w-full" size={12}>
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Laporan Aktivitas Tabung
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

              <Tooltip title="Download Excel">
                <Button
                  className="icon-only surface-standard flex-none"
                  size="medium"
                  color="grey"
                  variant="surface"
                  startIcon={<NiArrowInDown size={"medium"} />}
                  onClick={exportExcel}
                />
              </Tooltip>
            </Grid>
          </Grid>

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

  return (
    <Grid container spacing={5}>
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