import styled from "styled-components";
import { DatePicker } from "antd";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDashboardStore } from "../../../store/DashboardStore";

const { RangePicker } = DatePicker;

export const DateRangeFilter = () => {
  const getAllRange = () => {
    const startDate = dayjs("2000-01-01").startOf("day");
    const endDate = dayjs().endOf("day");
    return [startDate, endDate];
  };

  const [dates, setDates] = useState([...getAllRange()]);
  const [singleDate, setSingleDate] = useState(null);
  const [activeRange, setActiveRange] = useState("Todo");

  const { setRangoFechas, limpiarFechas } = useDashboardStore();

  const setSiempreRange = () => {
    const [startDate, endDate] = getAllRange();
    setDates([startDate, endDate]);
    setSingleDate(null);
    setActiveRange("Todo");
    setRangoFechas(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
  };

  const handleDateChange = (val) => {
    setDates(val || null);
    setSingleDate(null);
    if (val && val.length > 0) {
      setRangoFechas(val[0].format("YYYY-MM-DD"), val[1].format("YYYY-MM-DD"));
    }
  };

  const handleSingleDateChange = (date) => {
    setSingleDate(date);
    setDates(null);
    if (date) {
      setRangoFechas(date.format("YYYY-MM-DD"), date.format("YYYY-MM-DD"));
    }
    setActiveRange("Por día");
  };

  const setPresetRange = (days, rangeName) => {
    const startDate = dayjs().subtract(days, "day").startOf("day");
    const endDate = dayjs().endOf("day");
    setSingleDate(null);
    setDates([startDate, endDate]);
    setRangoFechas(startDate.format("YYYY-MM-DD"), endDate.format("YYYY-MM-DD"));
    setActiveRange(rangeName);
  };

  const selectToday = () => {
    const today = dayjs().startOf("day");
    setSingleDate(today);
    setDates(null);
    setRangoFechas(today.format("YYYY-MM-DD"), today.format("YYYY-MM-DD"));
    setActiveRange("Hoy");
  };

  useEffect(() => {
    setSiempreRange();
  }, []);

  return (
    <Container>
      <ButtonGroup>
        <TimeRangeButton onClick={setSiempreRange} $isActive={activeRange === "Todo"}>
          Todo
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "7 días"}
          onClick={() => setPresetRange(7, "7 días")}
        >
          Últimos 7 días
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "30 días"}
          onClick={() => setPresetRange(30, "30 días")}
        >
          Últimos 30 días
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "12 meses"}
          onClick={() => setPresetRange(365, "12 meses")}
        >
          Últimos 12 meses
        </TimeRangeButton>
        <TimeRangeButton $isActive={activeRange === "Hoy"} onClick={selectToday}>
          Hoy
        </TimeRangeButton>
        <TimeRangeButton
          $isActive={activeRange === "Por día"}
          onClick={() => setActiveRange("Por día")}
        >
          Por día
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

      {(activeRange === "30 días" ||
        activeRange === "12 meses" ||
        activeRange === "7 días" ||
        activeRange === "Todo") && (
        <StyledRangePicker format="YYYY-MM-DD" onChange={handleDateChange} value={dates} />
      )}

      {activeRange === "Por día" && (
        <StyledDatePicker
          format="YYYY-MM-DD"
          onChange={handleSingleDateChange}
          value={singleDate}
        />
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
