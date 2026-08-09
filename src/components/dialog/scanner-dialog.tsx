import { useState } from "react";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import NiChevronDownSmall from "@/icons/nexture/ni-chevron-down-small";
import { IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner";

interface ScannerDialogProps {
  allowMultiple?: boolean;
  scanPaused: boolean;
  setScanPaused: (value: boolean) => void;
  setScanResult: (value: string) => void;
}

export default function ScannerDialog({
  allowMultiple = false,
  scanPaused,
  setScanPaused,
  setScanResult,
}: ScannerDialogProps) {
  const [deviceId, setDeviceId] = useState<string>("");
  const devices = useDevices();
  const [localScanResult, setLocalScanResult] = useState<IDetectedBarcode[]>([]);
  const theme = useTheme();
  const fullScreenResponsive = useMediaQuery(theme.breakpoints.down("md"));

  const setScanResultFromLocal = (result: IDetectedBarcode[]) => {
    setLocalScanResult(result);
    if (result && result.length > 0) {
      setScanResult(result[0].rawValue);
    }
  };

  return (
    <Dialog fullScreen={fullScreenResponsive} open={!scanPaused} onClose={() => setScanPaused(true)}>
      <DialogTitle>Scan Barcode</DialogTitle>
      <DialogContent>
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
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setScanPaused(true)}>Tutup</Button>
      </DialogActions>
    </Dialog>
  );
}
