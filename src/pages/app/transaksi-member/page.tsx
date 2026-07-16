import { useCallback, useEffect, useState } from "react";

import {
  Box,
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
  Typography,
} from "@mui/material";
import {
  ColumnsPanelTrigger,
  DataGrid,
  GridActionsCellItem,
  GridColDef,
  GridRenderCellParams,
  GridRowId,
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
import Axios from "@/api/axios"
import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import 'dayjs/locale/id'

interface Row {
  id: string
  site: {
    id: string
    name: string
  }
  member?: {
    id: string
    code: string
    name: string
  },
  date: string
  transaction_type: "in" | "out" | "return" | "sell"
  tube_status: "filled" | "empty" | "broken" | "expired" | "display"
  nominal?: number
  document?: string
  item_count: number
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

  const getRows = () => {
    Axios.post(ApiEndpoint.TRANSACTION_MEMBER_INDEX)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
    })
  }

  useEffect(() => {
    getRows()
  }, [])

  const deleteTube = useCallback(
    (id: GridRowId) => () => {
      setTimeout(() => {
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
      });
    },
    [],
  );

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      width: 150,
      editable: false,
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
      field: "member",
      headerName: "Member",
      width: 150,
      editable: false,
      valueGetter: (_, row) => row.member ? `${row.member?.code} - ${row.member?.name}` : '',
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
      field: "actions",
      headerName: "Actions",
      type: "actions",
      minWidth: 80,
      flex: 1,
      align: "right",
      headerAlign: "right",
      getActions: (params) => [
        <GridActionsCellItem
          key={0}
          icon={<NiCrossSquare size="medium" />}
          label="Hapus"
          onClick={deleteTube(params.id)}
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
                Transaksi Member
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

              <Tooltip title="Tambah Tabung">
                <Button
                  className="icon-only surface-standard"
                  size="medium"
                  color="grey"
                  variant="surface"
                  startIcon={<NiPlus size={"medium"} />}
                  onClick={() => navigate('/transaksi-baru')}
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