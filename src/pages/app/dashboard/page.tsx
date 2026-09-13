import NiChevronRightSmall from "@/icons/nexture/ni-chevron-right-small";
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Card, CardContent, CircularProgress, Divider, Typography } from "@mui/material";
import { Grid } from "@mui/material";
import axios from "@/api/axios";
import ApiEndpoint from "@/api/api-endpoint"
import { useEffect, useState } from "react";
import NiOxygen from "@/icons/nexture/ni-oxygen";

interface ActiveTubeOwnCount {
  site: string
  content_type: {
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

export default function Page() {
  const [isLoading, setIsLoading] = useState(false)
  const [activeTubeOwnCount, setActiveTubeOwnCount] = useState<ActiveTubeOwnCount[]>([])

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

  return (
    <Grid container spacing={2}>
      <Grid size={12} className="mb-6">
        <Grid size={{ xs: 12, md: "grow" }}>
          <Typography variant="h1" component="h1" className="mb-0">
            Selamat Datang!
          </Typography>
        </Grid>
      </Grid>
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
              <Grid key={crypto.randomUUID()} size={{ xs: 12, md: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" component="h6" className="card-title">
                      {val.site}
                    </Typography>
                    {val.content_type.map((val2, _) => (
                      <Accordion className="mb-1.5">
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
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                STOK TOKO ISI
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.filled}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                STOK TOKO KOSONG
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.empty}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                STOK TOKO BERMASALAH
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.broken}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                STOK TOKO AFKIR
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.expired}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                STOK TOKO PAJANGAN
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.display}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                DIPINJAM
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.borrow}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                ISI KE SUPPLIER
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.refill}
                              </Typography>
                            </Box>
                            <Divider />
                            <Box className="flex justify-between items-center">
                              <Typography variant="h6" component="h6">
                                PERBAIKAN KE SUPPLIER
                              </Typography>
                              <Typography variant="h6" component="h6">
                                {val2.fixing}
                              </Typography>
                            </Box>
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
