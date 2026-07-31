import { Box, Button, Card, CardContent, FormControl, Grid, InputLabel, Select, SelectProps, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import 'dayjs/locale/id'
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRenderCellParams, GridRowSelectionModel, GridRowSpacingParams, useGridApiRef } from "@mui/x-data-grid";
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
}

interface DetailStockOpname {
  id: string
  date: string
  site: {
    id: string
    name: string
  }
  tube_count: number
  not_match_count: number
  tubes: StockOpnameItem[]
}

interface DialogProps {
	data?: DetailStockOpname
  onBack: () => void
}

export default function DetailStockOpname({ data, onBack }: DialogProps) {
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

  const [rows, setRows] = useState<StockOpnameItem[]>([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    data?.tubes && setRows(data?.tubes)
  }, [])

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "tube.number",
      headerName: "Nomor",
      editable: false,
      valueGetter: (_, row) => row.tube.number
    },
    {
      field: "tube.barcode",
      headerName: "Barcode",
      editable: false,
      valueGetter: (_, row) => row.tube.barcode
    },
    {
      field: "tube_content_type",
      headerName: "Isi",
      editable: false,
      valueGetter: (_, row) => `${row.tube.tube_content.code} - ${row.tube.tube_content.name}`
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
      field: "tube.position",
      headerName: "Posisi Tabung",
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
      field: "tube.status",
      headerName: "Kondisi",
      editable: false,
      valueGetter: (_, row) => {
        switch (row.tube.status) {
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
    },
    {
      field: "match",
      headerName: "Sesuai",
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
      field: "adjust",
      headerName: "Disesuaikan",
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
  ];

	return (
    <Grid container spacing={5}>
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
          </CardContent>
        </Card>
      </Grid>
      <Grid size={12}>
        <DataGrid
          apiRef={apiRef}
          rows={rows}
          columns={columns}
          density="compact"
          initialState={{
            columns: { columnVisibilityModel: { id: false } }
          }}
          autosizeOnMount
          autosizeOptions={{
            includeOutliers: true,
            includeHeaders: true,
            expand: true
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
