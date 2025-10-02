'use client';

// material-ui
import { useTheme } from '@mui/material/styles';

import { chartsGridClasses, LineChart } from '@mui/x-charts';

// 데이터와 라벨을 props로 받도록 수정

export default function ReportChart({ data = [], labels = [], label = 'Income' }) {
  const theme = useTheme();
  const axisFonstyle = { fill: theme.palette.text.secondary };

  return (
    <LineChart
      hideLegend
      grid={{ horizontal: true }}
      xAxis={[{ data: labels, scaleType: 'point', disableLine: true, disableTicks: true, tickLabelStyle: axisFonstyle }]}
      yAxis={[{ position: 'none' }]}
      series={[
        {
          data,
          showMark: false,
          id: 'ReportAreaChart',
          color: theme.palette.warning.main,
          label,
          valueFormatter: (value) => `$ ${value}`
        }
      ]}
      height={340}
      margin={{ top: 30, bottom: 25, left: 20, right: 20 }}
      sx={{ '& .MuiLineElement-root': { strokeWidth: 1 }, [`& .${chartsGridClasses.line}`]: { strokeDasharray: '5 3' } }}
    />
  );
}

