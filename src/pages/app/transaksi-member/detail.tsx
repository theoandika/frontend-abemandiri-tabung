import { Box, Button, Card, CardContent, Chip, FormControl, Grid, InputLabel, Select, SelectProps, Tooltip, Typography } from "@mui/material";
import dayjs from "dayjs";
import 'dayjs/locale/id'
import { rupiah } from "@/hooks/rupiah";
import NiDocumentFull from '@/icons/nexture/ni-document-full';
import { useCallback, useEffect, useState } from "react";
import { DataGrid, GridColDef, GridRowSelectionModel, GridRowSpacingParams, useGridApiRef } from "@mui/x-data-grid";
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

interface Item {
  id: string
  number: string
  barcode: string
  tube_content_type: {
    id: string
    code: string
    name: string
  }
  tube_owner: "DM" | "Non DM"
}

interface DataType {
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
	note: string
  nominal?: number
  document?: string
  items: Item[],
};

interface DialogProps {
	data?: DataType
  onBack: () => void
}

export default function DetailMemberTransaction({ data, onBack }: DialogProps) {
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

  const [rows, setRows] = useState<Item[]>([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    data?.items && setRows(data?.items)
  }, [])

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "date",
      headerName: "Tanggal",
      editable: false,
      type: "dateTime",
      valueFormatter: (value) => dayjs(value).locale('id').format("DD MMMM YYYY HH:mm")
    },
    {
      field: "number",
      headerName: "Nomor",
      editable: false,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      editable: false,
    },
    {
      field: "tube_content_type",
      headerName: "Isi",
      editable: false,
      valueGetter: (_, row) => `${row.tube_content_type.code} - ${row.tube_content_type.name}`
    },
    {
      field: "tube_owner",
      headerName: "Tabung DM",
      editable: false,
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
            Transaksi Member
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
                Member :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.member?.code} - {data?.member?.name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Masuk/Keluar :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.transaction_type == 'in' && 'Masuk'}
                {data?.transaction_type == 'out' && 'Keluar'}
                {data?.transaction_type == 'return' && 'Retur'}
                {data?.transaction_type == 'sell' && 'Jual'}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Kondisi :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.tube_status == 'empty' && 'Kosong'}
                {data?.tube_status == 'filled' && 'Isi'}
                {data?.tube_status == 'broken' && 'Rusak'}
                {data?.tube_status == 'expired' && 'Afkir'}
                {data?.tube_status == 'display' && 'Pajangan'}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Catatan :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.note}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Nominal Jaminan :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.nominal ? rupiah(data?.nominal) : <Chip label="Tidak ada" variant="filled" color="grey" />}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Dokumen Jaminan :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.document ? (
                  <Button
                    className="surface-standard"
                    size="small"
                    color="info"
                    variant="pastel"
                    startIcon={<NiDocumentFull size={"small"} />}
                    onClick={() => window.open(data?.document, '_blank')?.focus()}
                  >Lihat</Button>
                ) : <Chip label="Tidak ada" variant="filled" color="grey" />}
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
