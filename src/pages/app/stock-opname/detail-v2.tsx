import 'dayjs/locale/id'
import { useNavigate, useParams } from "react-router-dom";
import DetailStockOpname from "./detail";
import { useState } from "react";

export default function DetailStockOpnameV2() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const doBack = () => {
    navigate("/stock-opname")
  }
	return (
    <DetailStockOpname isLoading={isLoading} setIsLoading={setIsLoading} onBack={doBack} id={id} />
	);
}
