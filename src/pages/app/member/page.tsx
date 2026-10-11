import { useCallback, useEffect, useState } from "react";

import {
  Alert,
  Box,
  Button,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FilledInput,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
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
  GridRowSelectionModel,
  GridRowSpacingParams,
  QuickFilter,
  QuickFilterClear,
  QuickFilterControl,
  Toolbar,
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
import NiPlus from "@/icons/nexture/ni-plus";
import NiSearch from "@/icons/nexture/ni-search";
import { cn } from "@/lib/utils";

import ApiEndpoint from "@/api/api-endpoint"
import { useNavigate } from "react-router-dom";
import axios from "@/api/axios";
import DeleteConfirmation from "@/components/dialog/delete-confirmation";
import NiPenSquare from "@/icons/nexture/ni-pen-square";
import { useUserContext } from "@/hooks/use-user";
import NiUploadCloud from "@/icons/nexture/ni-upload-cloud";
import * as XLSX from 'xlsx';

interface Row {
  id: string,
  code: string,
  name: string,
  address: string
};

interface ExcelRow {
  "Kode Member": string,
  "Nama Member": string,
  "Alamat": string,
  "Telp": string
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

  const { checkPermission } = useUserContext()
  const [rows, setRows] = useState<Row[]>([]);
  const navigate = useNavigate()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [deleteId, setDeleteId] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [uploadErrorMessage, setUploadErrorMessage] = useState<string>("")
  const [excelRows, setExcelRows] = useState<ExcelRow[]>([]);
  const [importDialogOpen, setImportDialogOpen] = useState<boolean>(false)
  const [failedImportRows, setFailedImportRows] = useState<ExcelRow[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "completed">("idle");

  const getRows = () => {
    setIsLoading(true)
    axios.post(ApiEndpoint.MEMBER_INDEX)
    .then((res) => {
      let result: Row[] = res.data?.data
      setRows(result)
    })
    .finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    if (!checkPermission([], ['view-member'])) {
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
    axios.delete(ApiEndpoint.MEMBER_ALL + "/" + deleteId)
    .then (() => {
      getRows()
    })
    .catch(err => {
      let errData = err?.response?.data
      setErrorMessage(errData?.message)
    })
    .finally(() => setIsLoading(false))
  }

  const importExcel = () => {
    document.getElementById("import-excel")?.click()
  }

  const closeImportDialog = (_: React.MouseEvent<HTMLButtonElement>, r: React.ReactNode) => {
    if (r !== "backdropClick") {
      cancelImport()
    }
  }

  const loadExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setFailedImportRows([]);
    setUploadProgress(0);
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      setExcelRows(jsonData as ExcelRow[]);
      setImportDialogOpen(true);
    } catch (error) {
      setUploadErrorMessage("Gagal memuat file Excel: " + error);
    }
  }

  const cancelImport = () => {
    setUploadErrorMessage("")
    setImportDialogOpen(false)
    setExcelRows([])
    setFailedImportRows([])
    setUploadProgress(0)
  }

  const processImport = () => {
    setUploadState("uploading");
    setUploadProgress(0);
    setFailedImportRows([]);
    setUploadErrorMessage("")
    if (excelRows.length === 0) {
      setUploadErrorMessage("Tidak ada data untuk diunggah");
      setUploadState("completed");
      return;
    }
    excelRows.forEach((row) => {
      doImport(row);
    });
  }

  const doImport = (data: ExcelRow) => {
    let payload = {
      code: data["Kode Member"],
      name: data["Nama Member"],
      address: data["Alamat"],
      phone_number: data["Telp"]
    }
    axios.post(ApiEndpoint.MEMBER_ALL, payload)
    .catch((err) => {
      let errData = err?.response?.data
      setUploadErrorMessage(errData?.message);
      setFailedImportRows((prev) => [...prev, data]);
    })
    .finally(() => {
      setUploadProgress((prev) => prev + 1);
    })
  }

  useEffect(() => {
    if (excelRows.length == uploadProgress) {
      setUploadState("completed");
      getRows();
    }
  }, [uploadProgress]);

  useEffect(() => {
    if (excelRows.length == uploadProgress && failedImportRows.length <= 0) {
      setImportDialogOpen(false);
    }
  }, [uploadProgress, failedImportRows]);

  const columns: GridColDef<(typeof rows)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "code",
      headerName: "Kode Member",
      width: 200,
      editable: false,
    },
    {
      field: "name",
      headerName: "Nama Member",
      width: 200,
      editable: false,
    },
    {
      field: "address",
      headerName: "Alamat",
      minWidth: 200,
      flex: 1,
      editable: false,
    },
    {
      field: "phone_number",
      headerName: "Telp",
      minWidth: 200,
      flex: 1,
      editable: false,
    },
    {
      field: "actions",
      headerName: "Aksi",
      type: "actions",
      minWidth: 80,
      align: "right",
      headerAlign: "right",
      getActions: (params) => [
        checkPermission([], ['delete-member']) ? <GridActionsCellItem
          key={0}
          icon={<NiCrossSquare size="medium" />}
          label="Hapus"
          onClick={() => doDelete(params.row.id)}
          showInMenu
        /> : <></>,
        checkPermission([], ['update-supplier']) ? <GridActionsCellItem
          key={1}
          icon={<NiPenSquare size="medium" />}
          label="Ubah"
          onClick={() => navigate("/ubah-member/"+params.row.id)}
          showInMenu
        /> : <></>,
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
                Daftar Member
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: "auto" }} className="flex flex-row items-start gap-2">
              <Tooltip title="Pengaturan Kolom">
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

              {checkPermission([], ['create-member']) && (
                <Tooltip title="Tambah Member">
                  <Button
                    className="icon-only surface-standard"
                    size="medium"
                    color="grey"
                    variant="surface"
                    startIcon={<NiPlus size={"medium"} />}
                    onClick={() => navigate('/tambah-member')}
                  />
                </Tooltip>
              )}

              {checkPermission([], ['create-member']) && (
                <>
                  <input type="file" id="import-excel" accept=".xlsx" className="hidden" onChange={loadExcel} />
                  <Tooltip title="Import Excel">
                    <Button
                      className="icon-only surface-standard"
                      size="medium"
                      color="grey"
                      variant="surface"
                      startIcon={<NiUploadCloud size={"medium"} />}
                      onClick={importExcel}
                    />
                  </Tooltip>
                </>
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
      <Dialog open={importDialogOpen} onClose={closeImportDialog} maxWidth="xs" fullWidth disableEscapeKeyDown>
        <DialogTitle>Import Excel</DialogTitle>
        <DialogContent>
          <Box className="flex flex-col">
            {uploadErrorMessage && (
              <Alert color="error" className="mb-2 rounded!" icon={<NiCrossSquare />} >
                {uploadErrorMessage}
              </Alert>
            )}
            <Box className="flex justify-between">
              <DialogContentText>Jumlah Data</DialogContentText>
              <DialogContentText className="font-bold">{excelRows.length}</DialogContentText>
            </Box>
            <Divider flexItem />
            {uploadState === "uploading" && (
              <Box className="flex items-center">
                <Box className="me-1 w-full">
                  <LinearProgress variant="determinate" value={100 / excelRows.length * uploadProgress} />
                </Box>
                <Box>
                  <Typography variant="body2" className="text-text-secondary">{`${uploadProgress}/${excelRows.length}`}</Typography>
                </Box>
              </Box>
            )}
            {failedImportRows.length > 0 && (
              <Box className="flex justify-between">
                <DialogContentText className="text-red-500">Gagal Diunggah</DialogContentText>
                <DialogContentText className="font-bold text-red-500">{failedImportRows.length}</DialogContentText>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => cancelImport()} disabled={uploadState === "uploading"}>
            Batal
          </Button>
          <Button variant="pastel" onClick={() =>processImport()} disabled={uploadState === "uploading"}>
            Proses
          </Button>
        </DialogActions>
      </Dialog>
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