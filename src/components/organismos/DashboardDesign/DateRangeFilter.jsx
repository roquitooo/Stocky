import styled from "styled-components";
import { DatePicker } from "antd";
import { useState } from "react";
import dayjs from "dayjs";
import { useDashboardStore } from "../../../store/DashboardStore";

const { RangePicker } = DatePicker;

export const DateRangeFilter = () => {
  const mesActual = dayjs().startOf("month");
  const mesAnterior = mesActual.subtract(1, "month");

  const getAllRange = () => {
    const startDate = dayjs("2000-01-01").startOf("day");
    const endDate = dayjs().endOf("day");
    return [startDate, endDate];
  };

  const [dates, setDates] = useState(null);
  const [singleDate, setSingleDate] = useState(dayjs().startOf("day"));
  const [monthA, setMonthA] = useState(mesActual);
  const [monthB, setMonthB] = useState(mesAnterior);
  const [activeRange, setActiveRange] = useState("Hoy");

  const {
    setRangoFechas,
    limpiarFechas,
    setComparacionMeses,
    limpiarComparacion,
  } = useDashboardStore();

  const desactivarComparacion = () => {
    limpiarComparacion();
  };

  const aplicarComparacion = (mesBase, mesComparado) => {
    if (!mesBase || !mesComparado) return;

    const inicioBase = mesBase.startOf("month").format("YYYY-MM-DD");
    const finBase = mesBase.endOf("month").format("YYYY-MM-DD");
    const isoMesBase = mesBase.startOf("month").format("YYYY-MM-DD");
    const isoMesComparado = mesComparado.startOf("month").format("YYYY-MM-DD");

    setRangoFechas(inicioBase, finBase);
    setComparacionMeses({
      mesA: isoMesBase,
      mesB: isoMesComparado,
    });
  };

  const activarComparacionMeses = () => {
    const base = dayjs().startOf("month");
    const comparado = base.subtract(1, "month");
    setDates(null);
    setSingleDate(null);
    setMonthA(base);
    setMonthB(comparado);
    setActiveRange("Comparar meses");
    aplicarComparacion(base, comparado);
  };

  const setSiempreRange = () => {
    const [startDate, endDate] = getAllRange();
    desactivarComparacion();
    setDates([startDate, endDate]);
    setSingleDate(null);
    setActiveRange("Todo");
    setRangoFechas(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
  };

  const handleDateChange = (val) => {
    desactivarComparacion();
    setDates(val || null);
    setSingleDate(null);
    if (val && val.length > 0) {
      setRangoFechas(val[0].format("YYYY-MM-DD"), val[1].format("YYYY-MM-DD"));
    }
  };

  const handleSingleDateChange = (date) => {
    desactivarComparacion();
    setSingleDate(date);
    setDates(null);
    if (date) {
      setRangoFechas(date.format("YYYY-MM-DD"), date.format("YYYY-MM-DD"));
    }
    setActiveRange("Por d�a");
  };

  const setPresetRange = (days, rangeName) => {
    const startDate = dayjs().subtract(days, "day").startOf("day");
    const endDate = dayjs().endOf("day");
    desactivarComparacion();
    setSingleDate(null);
    setDates([startDate, endDate]);
    setRangoFechas(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
    setActiveRange(rangeName);
  };

  const selectToday = () => {
    const today = dayjs().startOf("day");
    desactivarComparacion();
    setSingleDate(today);
    setDates(null);
    setRangoFechas(today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"));
    setActiveRange("Hoy");
  };

  const handleMonthAChange = (date) => {
    setMonthA(date);
    aplicarComparacion(date, monthB);
  };

  const handleMonthBChange = (date) => {
    setMonthB(date);
    aplicarComparacion(monthA, date);
  };

  return (
    <Container>
      <ButtonGroup>
        <TimeRangeButton onClick={setSiempreRange} $isActive={activeRange === "Todo"}>
          Todo
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "7 d�as"}
          onClick={() => setPresetRange(7, "7 d�as")}
        >
          Ultimos 7 dias
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "30 dias"}
          onClick={() => setPresetRange(30, "30 dias")}
        >
          Ultimos 30 dias
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "12 meses"}
          onClick={() => setPresetRange(365, "12 meses")}
        >
          Ultimos 12 meses
        </TimeRangeButton>
        <TimeRangeButton $isActive={activeRange === "Hoy"} onClick={selectToday}>
          Hoy
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "Por dia"}
          onClick={() => setActiveRange("Por dia")}
        >
          Por dia
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "Comparar meses"}
          onClick={activarComparacionMeses}
        >
          Comparar meses
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "Limpiar"}
          onClick={() => {
            setDates(null);
            setSingleDate(null);
            limpiarFechas();
            setActiveRange("Rango");
          }}
        >
          Limpiar filtro
        </TimeRangeButton>
      </ButtonGroup>

      {(activeRange === "30 dias" ||
        activeRange === "12 meses" ||
        activeRange === "7 dias" ||
        activeRange === "Todo") && (
        <StyledRangePicker format="YYYY-MM-DD" onChange={handleDateChange} value={dates} />
      )}

      {activeRange === "Por dia" && (
        <StyledDatePicker
          format="YYYY-MM-DD"
          onChange={handleSingleDateChange}
          value={singleDate}
        />
      )}

      {activeRange === "Comparar meses" && (
        <CompareRow>
          <MonthBox>
            <span>Mes A</span>
            <StyledMonthPicker
              picker="month"
              format="MMMM YYYY"
              onChange={handleMonthAChange}
              value={monthA}
            />
          </MonthBox>
          <MonthBox>
            <span>Mes B</span>
            <StyledMonthPicker
              picker="month"
              format="MMMM YYYY"
              onChange={handleMonthBChange}
              value={monthB}
            />
          </MonthBox>
        </CompareRow>
      )}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 0;
  width: 100%;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    padding-bottom: 2px;

    &::-webkit-scrollbar {
      height: 4px;
    }
  }
`;

const TimeRangeButton = styled.button`
  color: ${({ theme }) => theme.text};
  background-color: ${({ $isActive, theme }) => ($isActive ? theme.bg : "transparent")};
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 1.1;
  cursor: pointer;
  white-space: nowrap;
  flex: 0 0 auto;
`;

const StyledRangePicker = styled(RangePicker)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg};
  border: 2px dashed ${({ theme }) => theme.body};

  .ant-picker-input > input {
    color: ${({ theme }) => theme.text};
    font-weight: bold;
  }

  .ant-picker-input input::placeholder {
    color: ${({ theme }) => theme.text};
  }

  .ant-picker-suffix,
  .ant-picker-separator {
    color: ${({ theme }) => theme.text};
  }

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }

  &:focus,
  &.ant-picker-focused {
    background-color: ${({ theme }) => theme.bg};
  }
`;

const StyledDatePicker = styled(DatePicker)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg};
  border: 2px dashed ${({ theme }) => theme.body};

  .ant-picker-input > input {
    color: ${({ theme }) => theme.text};
    font-weight: bold;
  }

  .ant-picker-input input::placeholder {
    color: ${({ theme }) => theme.text};
  }

  .ant-picker-suffix,
  .ant-picker-separator {
    color: ${({ theme }) => theme.text};
  }

  &:hover {
    background-color: ${({ theme }) => theme.body};
  }

  &:focus,
  &.ant-picker-focused {
    background-color: ${({ theme }) => theme.bg};
  }
`;

const StyledMonthPicker = styled(DatePicker)`
  width: 100%;
  background-color: ${({ theme }) => theme.bg};
  border: 2px dashed ${({ theme }) => theme.body};

  .ant-picker-input > input {
    color: ${({ theme }) => theme.text};
    font-weight: bold;
    text-transform: capitalize;
  }

  .ant-picker-suffix {
    color: ${({ theme }) => theme.text};
  }
`;

const CompareRow = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MonthBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  span {
    font-size: 12px;
    font-weight: 700;
    opacity: 0.85;
  }
`;
