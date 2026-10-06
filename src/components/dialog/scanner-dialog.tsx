import { useEffect, useState } from "react";

import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormLabel,
  MenuItem,
  Select,
  Tab,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import NiCamera from "@/icons/nexture/ni-camera";
import NiListNumber from "@/icons/nexture/ni-list-number";
import TabPanel from "@mui/lab/TabPanel";
import ApiEndpoint from "@/api/api-endpoint";
import axios from "@/api/axios";
import NiCross from "@/icons/nexture/ni-cross";
import NiPlus from "@/icons/nexture/ni-plus";

interface ScannerDialogProps {
  allowMultiple?: boolean;
  allowManual?: boolean;
  scanPaused: boolean;
  setScanPaused: (value: boolean) => void;
  setScanResult: (value: string) => void;
}

export default function ScannerDialog({
  allowMultiple = false,
  allowManual = true,
  scanPaused,
  setScanPaused,
  setScanResult,
}: ScannerDialogProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [deviceId, setDeviceId] = useState<string>("");
  const devices = useDevices();
  const [localScanResult, setLocalScanResult] = useState<IDetectedBarcode[]>([]);
  const [tabAdd, setTabAdd] = useState<string>("scan");
  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));
  const [tubeNumbers, setTubeNumbers] = useState<{ number: string, barcode: string }[]>([]);
  const [tubeNumber, setTubeNumber] = useState<{ number: string, barcode: string } | null>(null);

  const setScanResultFromLocal = (result: IDetectedBarcode[]) => {
    setLocalScanResult(result);
    if (result && result.length > 0) {
      setScanResult(result[0].rawValue);
    }
  };

  const getTubeNumberList = () => {
    setIsLoading(true)
    axios.get(ApiEndpoint.NUMBER_LIST)
    .then(res => {
      setTubeNumbers(res?.data?.data)
    })
    .finally(() => setIsLoading(false))
  }

  const setManualBarcode = () => {
    if (tubeNumber) {
      setScanResult(tubeNumber.barcode);
      if (!allowMultiple) {
        setScanPaused(true);
      }
      setTubeNumber(null);
    }
  }

  useEffect(() => {
    if (tabAdd === "manual") {
      getTubeNumberList()
    }
  }, [tabAdd]);

  return (
    <Dialog fullScreen={fullScreenResponsive} open={!scanPaused} onClose={() => setScanPaused(true)}>
      <DialogTitle>Masukkan Tabung</DialogTitle>
      <DialogContent>
        <Box>
          <TabContext value={tabAdd}>
            <Box>
              <TabList onChange={(_, val) => setTabAdd(val)} variant="fullWidth">
                <Tab label="Scan" value="scan" icon={<NiCamera size="medium" />} iconPosition="start" />
                {allowManual && (
                  <Tab label="Nomor Tabung" value="manual" icon={<NiListNumber size="medium" />} iconPosition="start" />
                )}
              </TabList>
            </Box>
            <TabPanel value="scan" className="p-0">
              <DialogContentText className="mb-4 text-justify">
                Pilih kamera dengan kualitas terbaik agar proses scan lebih cepat
              </DialogContentText>
              <Box className="flex w-full flex-col gap-2">
                <FormControl fullWidth size="small" variant="standard" className="outlined mb-0">
                  <Select
                    value={deviceId}
                    label="Kamera"
                    onChange={(e: any) => setDeviceId(e.target.value)}
                    IconComponent={NiChevronDownSmall}
                    MenuProps={{ className: "outlined" }}
                  >
                    {devices.map((item: any) => (
                      <MenuItem key={crypto.randomUUID()} value={item.deviceId}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Scanner
                  classNames={{ container: "w-full! max-w-100 self-center" }}
                  onScan={(result) => setScanResultFromLocal(result)}
                  paused={scanPaused}
                  allowMultiple={allowMultiple}
                  scanDelay={1000}
                  constraints={{
                    deviceId,
                    facingMode: "environment",
                    aspectRatio: 1,
                  }}
                  components={{
                    torch: true,
                    zoom: true,
                    finder: true,
                  }}
                  sound={true}
                />
                <DialogContentText className="text-success mt-2 text-center">
                  {localScanResult && localScanResult.length > 0 ? `Hasil Scan: ${localScanResult[0].rawValue}` : ""}
                </DialogContentText>
              </Box>
            </TabPanel>
            <TabPanel value="manual" className="p-0">
              <Box className="flex flex-col">
                <FormControl fullWidth>
                  <FormLabel component="label">Tabung *</FormLabel>
                  <Autocomplete
                    size="small"
                    popupIcon={<NiChevronDownSmall />}
                    clearIcon={<NiCross />}
                    value={tubeNumber}
                    options={tubeNumbers}
                    getOptionKey={(option) => option.barcode}
                    getOptionLabel={(option) => `N: ${option.number} -- B: ${option.barcode}`}
                    onChange={(_, val) => setTubeNumber(val ?? null)}
                    renderInput={(params) => (
                      <TextField {...params} variant="standard" className="outlined" placeholder="" />
                    )}
                    slotProps={{
                      popper: { className: "outlined" },
                      chip: {
                        variant: "filled",
                        size: "small",
                      },
                    }}
                    disabled={isLoading}
                  />
                </FormControl>
                <Button
                  size="small"
                  startIcon={<NiPlus />}
                  loading={isLoading}
                  loadingPosition="start"
                  variant="pastel"
                  color="primary"
                  onClick={() => setManualBarcode()}
                >Tambahkan</Button>
              </Box>
            </TabPanel>
          </TabContext>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScanPaused(true)}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
}
