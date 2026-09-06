import { useCallback, useEffect, useState } from "react";

import {
  Alert,
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
  Typography,
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  gridFilteredSortedRowEntriesSelector,
  GridRowSelectionModel,
  GridRowSpacingParams,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
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
import dayjs from "dayjs";
import 'dayjs/locale/id'

import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import { useUserContext } from "@/hooks/use-user";
import * as XLSX from 'xlsx';
import NiPrinter from "@/icons/nexture/ni-printer";
import { rupiah } from "@/hooks/rupiah";
import DetailCollateral from "./detail";

interface Row {
  id: string,
  date: string,
  site: {
    id: string,
    name: string
  },
  member: {
    id: string,
    code: string,
    name: string
  },
  type: string,
  pic: string,
  document_number: string | null,
  member_name: string,
  member_address: string | null,
  signatory_status: string | null,
  company_name: string | null,
  contact_person: string | null,
  payment_method: string | null,
  payment_date: string | null,
  return_payment_method: string | null,
  return_payment_date: string | null,
  collateral_audit: string | null,
  return_audit: string | null,
  document: string | null,
  collateral_items: CollateralItem[],
  total_quantity: number,
  total_nominal: number,
  generated_document: string,
};

interface CollateralItem {
  id: string,
  tube_content_type: {
    id: string,
    code: string,
    name: string
  },
  klep_condition: string | null,
  tube_cap: string | null,
  tube_quantity: number,
  nominal: number,
  total_amount: number
}

interface DataExport {
  Tanggal: string
  "No. Nota": string
  Cabang: string
  Member: string
  Tabung: number
  "Total Jaminan": string
  Jenis: string
  "Pembayaran Jaminan": string
  "Tanggal Bayar Jaminan": string
  "Pembayaran Pengembalian Jaminan": string
  "Tanggal Bayar Pengembalian Jaminan": string
  "Audit Jaminan": string
  "Audit Pengembalian": string
}

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
  const [rows, setRows] = useState<Row[]>([]);
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [openDetail, setOpenDetail] = useState<boolean>(false)
  const [activeData, setActiveData] = useState<Row | null>(null)

  const getRows = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.COLLATERAL)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
    })
    .finally(() => {
      setIsLoading(false)
      setTimeout(() => {
        apiRef.current?.autosizeColumns({
          includeOutliers: true,
          includeHeaders: true,
        })
      }, 100)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-collateral'])) {
      navigate('/404')
    } else {
      getRows()
    }
  }, [])

  const doDelete = (id: string) => {
    setDeleteId(id)
    setDeleteDialogOpen(true)
  }

  const deleteRow = () => {
    setIsLoading(true)
    axios.delete(ApiEndpoint.COLLATERAL + "/" + deleteId)
    .then (() => {
      getRows()
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoading(false))
  }

  const openGeneratedDocument = (url: string) => {
    window.open(url, '_blank')?.focus()
  }

  const exportExcel = () => {
    const filteredSortedRowEntries = gridFilteredSortedRowEntriesSelector(apiRef);
    const filteredRows = filteredSortedRowEntries.map(entry => entry.model);
    const dataExport: DataExport[] = filteredRows.map((row) => ({
      Tanggal: dayjs(row.date).locale('id').format("YYYY/MM/DD"),
      "No. Nota": row.document_number || "",
      Cabang: row.site.name,
      Member: `${row.member.code} - ${row.member.name}`,
      Tabung: row.total_quantity,
      "Total Jaminan": row.total_nominal,
      Jenis: row.type === "collateral" ? "Surat Jaminan" : "Pengembalian",
      "Pembayaran Jaminan": row.payment_method || "",
      "Tanggal Bayar Jaminan": row.payment_date ? dayjs(row.payment_date).locale('id').format("YYYY/MM/DD") : "",
      "Pembayaran Pengembalian Jaminan": row.return_payment_method || "",
      "Tanggal Bayar Pengembalian Jaminan": row.return_payment_date ? dayjs(row.return_payment_date).locale('id').format("YYYY/MM/DD") : "",
      "Audit Jaminan": row.collateral_audit || "",
      "Audit Pengembalian": row.return_audit || "",
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, "data_jaminan.xlsx");
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      width: 150,
      editable: false,
      type: "date",
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY")
    },
    {
      field: "document_number",
      headerName: "No. Nota",
      width: 100,
      editable: false,
    },
    {
      field: "site",
      headerName: "Cabang",
      width: 150,
      editable: false,
      valueGetter: (_, row) => row.site.name,
    },
    {
      field: "member",
      headerName: "Member",
      width: 150,
      editable: false,
      valueGetter: (_, row) => `${row.member.code} - ${row.member.name}`,
    },
    {
      field: "total_quantity",
      headerName: "Tabung",
      width: 100,
      editable: false,
    },
    {
      field: "total_nominal",
      headerName: "Total Jaminan",
      width: 120,
      editable: false,
      type: "number",
      valueGetter: (_, row) => rupiah(row.total_nominal),
    },
    {
      field: "type",
      headerName: "Jenis",
      width: 100,
      editable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "collateral", label: 'Surat Jaminan' },
        { value: "return", label: 'Pengembalian' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "collateral":
            return "Surat Jaminan";
          case "return":
            return "Pengembalian";
          default:
            return "";
        }
      },
    },
    {
      field: "payment_method",
      headerName: "Pembayaran Jaminan",
      width: 100,
      editable: false,
    },
    {
      field: "payment_date",
      headerName: "Tanggal Bayar Jaminan",
      width: 150,
      editable: false,
      type: "date",
      valueFormatter: (value) => value ? dayjs(value).locale('id').format("DD MMMM YYYY") : "",
    },
    {
      field: "return_payment_method",
      headerName: "Pembayaran Pengembalian Jaminan",
      width: 100,
      editable: false,
    },
    {
      field: "return_payment_date",
      headerName: "Tanggal Bayar Pengembalian Jaminan",
      width: 150,
      editable: false,
      type: "date",
      valueFormatter: (value) => value ? dayjs(value).locale('id').format("DD MMMM YYYY") : "",
    },
    {
      field: "collateral_audit",
      headerName: "Audit Jaminan",
      width: 100,
      editable: false,
    },
    {
      field: "return_audit",
      headerName: "Audit Pengembalian",
      width: 100,
      editable: false,
    },
    {
      field: "actions",
      headerName: "Aksi",
      type: "actions",
      minWidth: 80,
      flex: 1,
      align: "right",
      headerAlign: "right",
      getActions: (params) => {
        return [
          <GridActionsCellItem
            key={0}
            icon={<NiEyeOpen size="medium" />}
            label="Detail"
            onClick={() => doOpenDetail(params.row)}
            showInMenu
          />,
          checkPermission([], ['delete-collateral']) ? <GridActionsCellItem
            key={1}
            icon={<NiCrossSquare size="medium" />}
            label="Hapus"
            onClick={() => doDelete(params.row.id)}
            showInMenu
          /> : <></>,
          checkPermission([], ['update-collateral']) ? <GridActionsCellItem
            key={2}
            icon={<NiPenSquare size="medium" />}
            label="Ubah"
            onClick={() => navigate("/ubah-jaminan/" + params.row.id)}
            showInMenu
          /> : <></>,
          <GridActionsCellItem
            key={0}
            icon={<NiPrinter size="medium" />}
            label="Print"
            onClick={() => openGeneratedDocument(params.row.generated_document)}
            showInMenu
          />,
        ]
      }
    },
  ];

  const doOpenDetail = (data: Row) => {
    setActiveData(data)
    setOpenDetail(true)
  }

  const doBack = () => {
    setActiveData(null)
    setOpenDetail(false)
  }

  if (openDetail && activeData) return <DetailCollateral data={activeData} onBack={doBack} />

  function CustomToolbar() {
    return (
      <Toolbar className="min-h-auto border-none">
        <Grid container spacing={5} className="mb-4 w-full">
          <Grid container spacing={2.5} className="w-full" size={12}>
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Daftar Jaminan
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

              {checkPermission([], ['create-collateral']) && (
                <Tooltip title="Tambah Jaminan">
                  <Button
                    className="icon-only surface-standard"
                    size="medium"
                    color="grey"
                    variant="surface"
                    startIcon={<NiPlus size={"medium"} />}
                    onClick={() => navigate('/tambah-jaminan')}
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
      <DeleteConfirmation setOpen={setDeleteDialogOpen} open={deleteDialogOpen} onConfirm={deleteRow} />
      <Grid size={12}>
        <DataGrid
          apiRef={apiRef}
          loading={isLoading}
          rows={rows}
          columns={columns}
          initialState={{
            columns: { columnVisibilityModel: { id: false } },
          }}
          autosizeOptions={{
            includeOutliers: true,
            includeHeaders: true,
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