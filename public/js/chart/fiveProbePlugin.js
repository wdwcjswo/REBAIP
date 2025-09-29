const fiveProbePlugin = {
  id: 'fiveProbePlugin',
  afterDatasetsDraw(chart, args, pluginOptions) {
    const {ctx, chartArea, scales} = chart;
    if (!chartArea) return;

    const xScale = scales.x;
    const yScale = scales.y;

    // 내부 5분할 지점 (캔버스 픽셀 기준)
    const xs = [1/6, 2/6, 3/6, 4/6, 5/6].map(r => chartArea.left + (chartArea.width * r));

    // 표기용 대상 데이터셋 선택 (옵션으로 지정 가능; 없으면 첫 번째 보이는 라인/스캐터/바)
    const dsIndex =
      pluginOptions?.datasetIndex ??
      chart.getSortedVisibleDatasetMetas().find(m => ['line','scatter','bar'].includes(m.type))?.index ?? 0;

    const ds = chart.data.datasets?.[dsIndex];
    if (!ds) return;

    // x 픽셀 -> 스케일 값
    const xValues = xs.map(px => xScale.getValueForPixel(px));

    // x 값에 대한 y 샘플링: (1) (x,y) 객체배열이면 선형 보간, (2) labels + data면 라벨 근처값
    const yAt = (xVal) => {
      // (x,y) 객체배열?
      const data = ds.data;
      if (Array.isArray(data) && typeof data[0] === 'object') {
        // x 정렬 가정(정렬 안돼있으면 정렬 사본 만들어도 됨)
        // 인접한 두 점 찾아 선형보간
        let prev = null, next = null;
        for (let i = 0; i < data.length; i++) {
          const p = data[i];
          const xv = p.x instanceof Date ? p.x.getTime() : +p.x;
          const target = xVal instanceof Date ? xVal.getTime() : +xVal;
          if (xv <= target) prev = p;
          if (xv >= target) { next = p; break; }
        }
        if (!prev && !next) return null;
        if (!prev) return +next.y;
        if (!next) return +prev.y;
        const x0 = prev.x instanceof Date ? prev.x.getTime() : +prev.x;
        const x1 = next.x instanceof Date ? next.x.getTime() : +next.x;
        const y0 = +prev.y, y1 = +next.y;
        if (x1 === x0) return y0;
        const t = ((xVal instanceof Date ? xVal.getTime() : +xVal) - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      } else {
        // labels + data 구조: xVal과 가장 가까운 라벨 인덱스 사용
        const labels = chart.data.labels || [];
        // 라벨 값이 날짜문자열/숫자문자열일 수 있음 → 숫자 비교 준비
        const toNum = (v) => v instanceof Date ? v.getTime() : (isNaN(+v) ? v : +v);
        const target = toNum(xVal);
        let bestIdx = 0, bestDiff = Infinity;
        for (let i = 0; i < labels.length; i++) {
          const lv = toNum(labels[i]);
          const diff = typeof lv === 'number' && typeof target === 'number'
            ? Math.abs(lv - target) : (lv === target ? 0 : Infinity);
          if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
        }
        const y = Array.isArray(ds.data) ? ds.data[bestIdx] : null;
        return y != null ? +y : null;
      }
    };

    // 스타일 옵션
    const lineColor = pluginOptions?.lineColor ?? 'rgba(0,0,0,0.25)';
    const dash = pluginOptions?.borderDash ?? [4, 4];
    const tipBg = pluginOptions?.tipBg ?? 'rgba(0,0,0,0.7)';
    const tipFg = pluginOptions?.tipFg ?? '#fff';
    const tipPadding = 6;
    const tipRadius = 6;

    ctx.save();

    xs.forEach((xPx, i) => {
      const xv = xValues[i];
      const yv = yAt(xv);
      if (yv == null) return;

      // 1) 수직 가이드선
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.moveTo(xPx, chartArea.top);
      ctx.lineTo(xPx, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2) y 위치 픽셀
      

      // 4) 라벨 텍스트 구성 (x, y 표시)
      const xLabelFormatter = pluginOptions?.xFormatter ?? ((v) => {
        return getChartXValue(chart, v);
      });
      
      const xVal = xLabelFormatter(xv);
      const yVal = getChartYValue(chart, xVal);
      
      
      const yPx = yScale.getPixelForValue(yVal);

      // 3) 원형 마커(선택)
      ctx.beginPath();
      ctx.fillStyle = tipBg;
      ctx.arc(xPx, yPx, 3, 0, Math.PI * 2);
      ctx.fill();

      const roundedY  = Math.round(yVal * 1000) / 1000;

      const text = `\n ${roundedY}`;
      const lines = text.split('\n');

      ctx.font = '12px sans-serif';
      ctx.textBaseline = 'top';
      ctx.textAlign = 'left';

      const textW = Math.max(...lines.map(s => ctx.measureText(s).width));
      const textH = (lines.length -1) * 14; // 대략 줄간격

      // 5) 라벨 박스 위치(좌/우 자동 배치)
      const boxW = textW + tipPadding * 2;
      const boxH = textH + tipPadding * 2;
      const leftPref = xPx + 8 + boxW <= chartArea.right;
      const boxX = leftPref ? xPx + 8 : xPx - 8 - boxW;

      // 화면 밖으로 나가지 않게 Y 클램프
      let boxY = yPx - boxH / 2;
      if (boxY < chartArea.top + 4) boxY = chartArea.top + 4;
      if (boxY + boxH > chartArea.bottom - 4) boxY = chartArea.bottom - 4;

      // 6) 박스 그리기(둥근모서리)
      const r = tipRadius;
      ctx.fillStyle = tipBg;
      ctx.beginPath();
      ctx.moveTo(boxX + r, boxY);
      ctx.lineTo(boxX + boxW - r, boxY);
      ctx.quadraticCurveTo(boxX + boxW, boxY, boxX + boxW, boxY + r);
      ctx.lineTo(boxX + boxW, boxY + boxH - r);
      ctx.quadraticCurveTo(boxX + boxW, boxY + boxH, boxX + boxW - r, boxY + boxH);
      ctx.lineTo(boxX + r, boxY + boxH);
      ctx.quadraticCurveTo(boxX, boxY + boxH, boxX, boxY + boxH - r);
      ctx.lineTo(boxX, boxY + r);
      ctx.quadraticCurveTo(boxX, boxY, boxX + r, boxY);
      ctx.fill();

      // 7) 텍스트
      ctx.fillStyle = tipFg;
      let ty = boxY + tipPadding;
      lines.forEach(line => {
    	 if(line != '') {
    	        ctx.fillText(line, boxX + tipPadding, ty);
    	        ty += 14;
    	 } 
    	  
      });
    });

    ctx.restore();
  }
};

function getChartXValue(chart, index, datasetIndex = 0) {
    
    const labels = chart.data.labels;
    const data = chart.data.datasets[datasetIndex].data;
    
    return labels[index];
}

function getChartYValue(chart, xValue, datasetIndex = 0) {
    
    const labels = chart.data.labels;
    const data = chart.data.datasets[datasetIndex].data;
    
    const index = labels.indexOf(xValue);
    
    //console.log(xValue + ") X IDX : " + index );
    
    if(index !== -1) {
        
        return chart.data.datasets[datasetIndex].data[index];
        
    } else {
        
        const avg = data.reduce((a,b) => a+b,0) / data.length;
        return avg;
    }
}