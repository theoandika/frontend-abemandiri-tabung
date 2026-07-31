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
  Typography,
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GridRowSpacingParams,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
} from "@mui/x-data-grid";

// import DataGridInput from "@/components/data-grid/data-grid-input";
// import { DataGridPaginationFullPage } from "@/components/data-grid/data-grid-pagination";
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
import NiCheckSquare from "@/icons/nexture/ni-check-square";
import { cn } from "@/lib/utils";

import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import NiBarcode from "@/icons/nexture/ni-barcode";
import axios from "@/api/axios";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import NiCrossFull from "@/icons/nexture/ni-cross-full";
import NiCheckFull from "@/icons/nexture/ni-check-full";
import NiEyeOpen from "@/icons/nexture/ni-eye-open";
import DetailTube from "./detail";
import { useUserContext } from "@/hooks/use-user";

interface Row {
  id: string,
  site: {
    id: string,
    name: string
  },
  number: string,
  barcode?: string,
  tube_content: {
    id: string,
    code: string,
    name: string
  },
  type: string,
  own: boolean,
  active: boolean,
  status: string,
  position: string,
  second_owner?: {
    id: string,
    code: string,
    name: string
  },
  photo?: string
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

  const { checkPermission } = useUserContext()
  const [rows, setRows] = useState<Row[]>([]);
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [openDetail, setOpenDetail] = useState<boolean>(false)
  const [activeData, setActiveData] = useState<Row>()

  const getRows = () => {
    setIsLoading(true)
    axios.post(ApiEndpoint.TUBE_INDEX)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-tube'])) {
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
    axios.delete(ApiEndpoint.CREATE_TUBE + "/" + deleteId)
    .then (() => {
      getRows()
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoading(false))
  }

  const activate = (id: string) => {
    axios.get(ApiEndpoint.CREATE_TUBE + "/" + id + "/activate")
    .then (() => {
      getRows()
    })
  }

  const deactivate = (id: string) => {
    axios.get(ApiEndpoint.CREATE_TUBE + "/" + id + "/deactivate")
    .then (() => {
      getRows()
    })
  }

  const doOpenDetail = (data: Row) => {
    setActiveData(data)
    setOpenDetail(true)
  }

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "number",
      headerName: "Nomor",
      width: 120,
      editable: false,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      width: 120,
      editable: false,
    },
    {
      field: "tube_content",
      headerName: "Isi",
      width: 100,
      editable: false,
      valueGetter: (_, row) => `${row.tube_content.code} - ${row.tube_content.name}`,
    },
    {
      field: "type",
      headerName: "Jenis",
      width: 100,
      editable: false,
      type: "singleSelect",
      valueOptions: [
        { value: "medical", label: 'Medis' },
        { value: "industry", label: 'Industri' },
      ],
      valueFormatter: (value) => {
        switch (value) {
          case "medical":
            return "Medis";
          case "industry":
            return "Industri";
          default:
            return "";
        }
      },
    },
    {
      field: "own",
      headerName: "Tabung DM",
      width: 100,
      align: "left",
      headerAlign: "left",
      editable: false,
      type: "boolean",
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
      field: "position",
      headerName: "Posisi Tabung",
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
      field: "status",
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
        { value: "unknown", label: 'Tidak diketahui' },
      ],
      renderCell: (params: GridRenderCellParams<any, string>) => {
        const value = params.value;
        switch (value) {
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
          case "unknown":
            return "Tidak diketahui"
          default:
            return ""
        }
      },
    },
    {
      field: "active",
      headerName: "Aktif",
      width: 100,
      align: "left",
      headerAlign: "left",
      editable: false,
      type: "boolean",
      renderCell: (params: GridRenderCellParams<any, boolean>) => {
        const value = params.value;
        if (typeof value !== undefined) {
          return value ? <NiCheckSquare className="text-success" /> : <NiCrossSquare className="text-error" />;
        } else {
          return <Box></Box>;
        }
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
      getActions: (params) => {
        return [
          <GridActionsCellItem
            key={0}
            icon={<NiEyeOpen size="medium" />}
            label="Detail"
            onClick={() => doOpenDetail(params.row)}
            showInMenu
          />,
          checkPermission([], ['delete-tube']) ? <GridActionsCellItem
            key={1}
            icon={<NiCrossSquare size="medium" />}
            label="Hapus"
            onClick={() => doDelete(params.row.id)}
            showInMenu
          /> : <></>,
          checkPermission([], ['update-tube']) ? <GridActionsCellItem
            key={2}
            icon={<NiPenSquare size="medium" />}
            label="Ubah"
            onClick={() => navigate("/ubah-tabung/" + params.row.id)}
            showInMenu
          /> : <></>,
          checkPermission([], ['update-tube']) ? <GridActionsCellItem
            key={3}
            icon={params.row.active ? <NiCrossFull size="medium" /> : <NiCheckFull size="medium" />}
            label={params.row.active ? "Non Aktif" : "Aktif"}
            onClick={() => params.row.active ? deactivate(params.row.id) : activate(params.row.id)}
            showInMenu
          /> : <></>,
        ]
      }
    },
  ];

  function CustomToolbar() {
    return (
      <Toolbar className="min-h-auto border-none">
        <Grid container spacing={5} className="mb-4 w-full">
          <Grid container spacing={2.5} className="w-full" size={12}>
            <Grid size={{ xs: 12, md: "grow" }}>
              <Typography variant="h1" component="h1" className="mb-0">
                Daftar Tabung
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
                />
              </Tooltip>

              {checkPermission([], ['view-tube-barcode']) && (
                <Tooltip title="Ubah Barcode">
                  <Button
                    className="icon-only surface-standard"
                    size="medium"
                    color="grey"
                    variant="surface"
                    startIcon={<NiBarcode size={"medium"} />}
                    onClick={() => navigate('/ubah-barcode')}
                  />
                </Tooltip>
              )}

              {checkPermission([], ['create-tube']) && (
                <Tooltip title="Tambah Tabung">
                  <Button
                    className="icon-only surface-standard"
                    size="medium"
                    color="grey"
                    variant="surface"
                    startIcon={<NiPlus size={"medium"} />}
                    onClick={() => navigate('/tambah-tabung')}
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
      <DetailTube openDialog={openDetail} setOpenDialog={setOpenDetail} data={activeData} />
      <Grid size={12}>
        <DataGrid
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