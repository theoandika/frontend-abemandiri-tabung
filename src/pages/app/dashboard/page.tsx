import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FilledInput, FormControl, IconButton, InputAdornment, InputLabel, Select, SelectProps, Toolbar, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Grid } from "@mui/material";
import axios from "@/api/axios";
import ApiEndpoint from "@/api/api-endpoint"
import { useCallback, useEffect, useState } from "react";
import NiOxygen from "@/icons/nexture/ni-oxygen";
import { DataGrid, GridColDef, GridRowSelectionModel, GridRowSpacingParams, QuickFilter, QuickFilterClear, QuickFilterControl } from "@mui/x-data-grid";
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
import { cn } from "@/lib/utils";

interface ActiveTubeOwnCount {
  site_id: string
  site: string
  content_type: {
    content_type_id: string
    content_type: string
    empty: number
    filled: number
    broken: number
    expired: number
    display: number
    refill: number
    borrow: number
    fixing: number
  }[]
}

interface TubeDetail {
  id: string
  number: string
  barcode: string
}

export default function Page() {
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>({
    type: "include",
    ids: new Set(),
  });
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 5,
  });

  const getRowSpacing = useCallback((params: GridRowSpacingParams) => {
    return {
      top: params.isFirstVisible ? 0 : 5,
      bottom: 5,
    };
  }, []);

  const [isLoading, setIsLoading] = useState(false)
  const [activeTubeOwnCount, setActiveTubeOwnCount] = useState<ActiveTubeOwnCount[]>([])
  const [tubesByStatus, setTubesByStatus] = useState<Record<string, TubeDetail[]>>({})
  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTubeByStatus, setActiveTubeByStatus] = useState<{ site: string, content: string, status: string, tubes: TubeDetail[] }>({
    site: "",
    content: "",
    status: "",
    tubes: []
  })
  const [showTubes, setShowTubes] = useState<boolean>(false)

  const getActiveTubeOwnCount = () => {
    setActiveTubeOwnCount([])
    setIsLoading(true)
    axios.get(ApiEndpoint.ACTIVE_TUBE_OWN_COUNT)
    .then(res => {
      setActiveTubeOwnCount(res.data?.data)
    })
    .then(() => setIsLoading(false))
  }

  useEffect(() => {
    getActiveTubeOwnCount()
  }, [])

  const getTubes = (siteId: string, siteName: string, contentId: string, contentName: string, status: string, statusName: string) => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    if (tubesByStatus[`${siteId}-${contentId}-${status}`]) {
      setActiveTubeByStatus({
        site: siteName,
        content: contentName,
        status: statusName,
        tubes: tubesByStatus[`${siteId}-${contentId}-${status}`]
      })
      setShowTubes(true)
      return;
    }
    setTubesByStatus(prev => ({
      ...prev,
      [`${siteId}-${contentId}-${status}`]: []
    }));
    axios.post(ApiEndpoint.TUBE_BY_STATUS, { site: siteId, content_type: contentId, status: status })
    .then(res => {
      setTubesByStatus(prev => ({
        ...prev,
        [`${siteId}-${contentId}-${status}`]: res?.data?.data
      }));
      setActiveTubeByStatus({
        site: siteName,
        content: contentName,
        status: statusName,
        tubes: res?.data?.data
      })
      setShowTubes(true)
    });
  }

  const columns: GridColDef<(typeof activeTubeByStatus.tubes)[number]>[] = [
    { field: "id", headerName: "ID", width: 90, filterable: false },
    {
      field: "number",
      headerName: "Nomor Tabung",
      width: 200,
      editable: false,
      sortable: false,
      filterable: false,
      flex: 1,
    },
    {
      field: "barcode",
      headerName: "Barcode",
      width: 200,
      editable: false,
      sortable: false,
      filterable: false,
      flex: 1,
    },
  ];

  function CustomToolbar() {
    return (
      <Toolbar className="min-h-auto border-none">
        <Grid container spacing={5} className="mb-4 w-full">
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
    <Grid container spacing={2}>
      <Grid size={12} className="mb-6">
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Selamat Datang!
          </Typography>
        </Grid>
      </Grid>
      <Dialog fullWidth maxWidth="md" fullScreen={fullScreenResponsive} open={showTubes}>
        <DialogTitle>{activeTubeByStatus.site} - {activeTubeByStatus.content} - {activeTubeByStatus.status}</DialogTitle>
        <DialogContent className="bg-background">
          <DataGrid
            rows={activeTubeByStatus.tubes}
            columns={columns}
            initialState={{
              columns: { columnVisibilityModel: { id: false } },
            }}
            getRowSpacing={getRowSpacing}
            rowHeight={68}
            columnHeaderHeight={32}
            disableRowSelectionOnClick
            className="full-page border-none mt-4"
            pagination
            paginationModel={paginationModel}
            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
            pageSizeOptions={[5,10]}
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTubes(false)}>Tutup</Button>
        </DialogActions>
      </Dialog>
      {isLoading && (
        <Box className="flex flex-row items-center justify-center h-25 w-full">
          <CircularProgress color="primary" size={32} />
        </Box>
      )}
      {activeTubeOwnCount.length > 0 && (
        <>
          <Typography variant="h6" component="h6" className="mt-2 mb-2 lg:mt-0 ">
            Jumlah Tabung DM
          </Typography>
          <Grid size={12} container spacing={2}>
            {activeTubeOwnCount.map((val, _) => (
              <Grid key={val.site_id} size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h6" className="card-title">
                      {val.site}
                    </Typography>
                    {val.content_type.map((val2, _) => (
                      <Accordion className="mb-1.5" key={val.site_id + val2.content_type_id}>
                        <AccordionSummary className="group">
                          <Button
                            component="div"
                            variant="pastel"
                            size="large"
                            color="text-primary"
                            className="full-width-button hover:text-primary group-aria-expanded:text-primary group-aria-expanded:rounded-b-none hover:bg-gray-500/10"
                            startIcon={<NiOxygen size={"medium"} />}
                            endIcon={<NiChevronRightSmall size={20} className="accordion-rotate" />}
                          >
                            {val2.content_type}
                          </Button>
                        </AccordionSummary>
                        <AccordionDetails className="bg-grey-500/10 mb-1.5 rounded-b-lg px-6 py-4 w-full">
                          <Box className="flex flex-col gap-1.5">
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "filled", "STOK TOKO ISI")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  STOK TOKO ISI
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.filled}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary group-aria-expanded:text-primary group-aria-expanded:rounded-b-none hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} className="accordion-rotate" />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "empty", "STOK TOKO KOSONG")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  STOK TOKO KOSONG
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.empty}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "broken", "STOK TOKO BERMASALAH")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  STOK TOKO BERMASALAH
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.broken}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "expired", "STOK TOKO AFKIR")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  STOK TOKO AFKIR
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.expired}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "display", "STOK TOKO PAJANGAN")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  STOK TOKO PAJANGAN
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.display}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "borrow", "DIPINJAM")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  DIPINJAM
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.borrow}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "refill", "ISI KE SUPPLIER")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  ISI KE SUPPLIER
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.refill}
                                </Typography>
                              </Box>
                            </Button>
                            <Button
                              variant="pastel"
                              size="large"
                              color="text-primary"
                              className="rounded full-width-button hover:text-primary hover:bg-gray-500/10"
                              endIcon={<NiChevronRightSmall size={20} />}
                              onClick={() => getTubes(val.site_id, val.site, val2.content_type_id, val2.content_type, "fixing", "PERBAIKAN KE SUPPLIER")}
                            >
                              <Box className="w-full flex justify-between items-center">
                                <Typography variant="h6" component="h6">
                                  PERBAIKAN KE SUPPLIER
                                </Typography>
                                <Typography variant="h6" component="h6">
                                  {val2.fixing}
                                </Typography>
                              </Box>
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Grid>
  );
}
