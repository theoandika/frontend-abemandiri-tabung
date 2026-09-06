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

interface DialogProps {
	data?: Row
  onBack: () => void
}

export default function DetailCollateral({ data, onBack }: DialogProps) {
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

  const [rows, setRows] = useState<CollateralItem[]>([]);
  const apiRef = useGridApiRef();

  useEffect(() => {
    data?.collateral_items && setRows(data?.collateral_items)
  }, [])

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "tube_content_type",
      headerName: "Isi",
      editable: false,
      valueGetter: (_, row) => `${row.tube_content_type.code} - ${row.tube_content_type.name}`,
    },
    {
      field: "klep_condition",
      headerName: "Kondisi Klep",
      editable: false,
    },
    {
      field: "tube_cap",
      headerName: "Tutup Tabung",
      editable: false,
    },
    {
      field: "tube_quantity",
      headerName: "Qty",
      editable: false,
    },
    {
      field: "nominal",
      headerName: "Jaminan",
      editable: false,
      valueGetter: (_, row) => rupiah(row.nominal),
    },
    {
      field: "total_amount",
      headerName: "Total",
      editable: false,
      valueGetter: (_, row) => rupiah(row.total_amount),
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
            {data?.type == 'collateral' ? 'Detail Jaminan' : 'Detail Pengembalian'}
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
                {dayjs(data?.date).locale('id').format("DD MMMM YYYY")}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                No. Nota :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.document_number}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Cabang :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.site.name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Tipe Dokumen :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.type == 'collateral' && 'Surat Jaminan'}
                {data?.type == 'return' && 'Pengembalian'}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                PIC :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.pic}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Member :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.member?.code} - {data?.member?.name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Nama :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.member_name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Alamat :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.member_address}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Status Penandatangan :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.signatory_status}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Nama Usaha :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.company_name}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                No. Kontak :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.contact_person}
              </Grid>
              {data?.type == 'collateral' && (
                <>
                  <Grid size={{ xs: 6, md: 4}}>
                    Pembayaran Jaminan :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data?.payment_method}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Tanggal Bayar Jaminan :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {dayjs(data?.payment_date).locale('id').format("DD MMMM YYYY")}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Surat Peminjaman Perusahaan :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data?.document ? (
                      <Button
                        className="surface-standard"
                        size="small"
                        color="info"
                        variant="pastel"
                        startIcon={<NiDocumentFull size={"small"} />}
                        onClick={() => window.open(data?.document ?? "", '_blank')?.focus()}
                      >Lihat</Button>
                    ) : <Chip label="Tidak ada" variant="filled" color="grey" />}
                  </Grid>
                </>
              )}
              {data?.type == 'return' && (
                <>
                  <Grid size={{ xs: 6, md: 4}}>
                    Pembayaran Pengembalian :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {data?.return_payment_method}
                  </Grid>
                  <Grid size={{ xs: 6, md: 4}}>
                    Tanggal Bayar Pengembalian :
                  </Grid>
                  <Grid size={{ xs: 6, md: 8}}>
                    {dayjs(data?.return_payment_date).locale('id').format("DD MMMM YYYY")}
                  </Grid>
                </>
              )}
              <Grid size={{ xs: 6, md: 4}}>
                Jumlah Tabung :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.total_quantity}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                Total Jaminan :
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {rupiah(data?.total_nominal ?? 0)}
              </Grid>
              <Grid size={{ xs: 6, md: 4}}>
                {data?.type == 'collateral' ? 'Print Jaminan' : 'Print Pengembalian'}
              </Grid>
              <Grid size={{ xs: 6, md: 8}}>
                {data?.generated_document ? (
                  <Button
                    className="surface-standard"
                    size="small"
                    color="info"
                    variant="pastel"
                    startIcon={<NiDocumentFull size={"small"} />}
                    onClick={() => window.open(data?.generated_document ?? "", '_blank')?.focus()}
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
