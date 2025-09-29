// ✅ 플러그인: 5분할 프로브 + 멀티 데이터셋 지원 + time/date 스케일 지원
const reb_datalabel = {
  id: 'reb_datalabel',
  afterDatasetsDraw(chart, args, pluginOptions) {
    const { ctx, chartArea, scales } = chart;
    if (!chartArea) return;

    const xScale = scales.x;
    if (!xScale) return;

    // ---- 옵션 기본값
    const divisions = pluginOptions?.divisions ?? 5; // 5분할
    const lineColor = pluginOptions?.lineColor ?? 'rgba(0,0,0,0.25)';
    const dash = pluginOptions?.borderDash ?? [4, 4];
    const tipBg = pluginOptions?.tipBg ?? 'rgba(0,0,0,0.8)';
    const tipFg = pluginOptions?.tipFg ?? '#fff';
    const tipPadding = pluginOptions?.tipPadding ?? 6;
    const tipRadius = pluginOptions?.tipRadius ?? 6;

    // x 라벨 포맷터: time 스케일의 값(주로 ms) → 문자열
    const xFormatter = pluginOptions?.xFormatter ?? ((v) => {
      const ms = (v instanceof Date) ? v.getTime() : (typeof v === 'number' ? v : Date.parse(v));
      if (!isFinite(ms)) return String(v);
      const d = new Date(ms);
      // yyyy-MM-dd
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${dd}`;
    });

    // y 라벨 포맷터
    const yFormatter = pluginOptions?.yFormatter ?? ((v, ds, scaleId) => {
      // 데이터셋/축에 따라 다르게 포맷하고 싶으면 여기서 분기
      return (typeof v === 'number') ? v.toLocaleString() : String(v);
    });

    // ---- 보이는 데이터셋들만 수집 (line/scatter/bar)
    const metas = chart.getSortedVisibleDatasetMetas()
      .filter(m => ['line', 'scatter', 'bar'].includes(m.type));

    if (metas.length === 0) return;

    // ---- 픽셀 기준으로 내부 등분 x 좌표 계산
    const steps = Array.from({ length: divisions }, (_, i) => (i + 1) / (divisions + 1));
    const xPixels = steps.map(r => chartArea.left + chartArea.width * r);

    // 픽셀 → x 값 (time 스케일이면 주로 ms number가 나옴)
    const xValues = xPixels.map(px => xScale.getValueForPixel(px));

    
    // 변환 유틸: 다양한 타입의 x를 ms number로
    const toMs = (x) => {
      if (x instanceof Date) return x.getTime();
      if (typeof x === 'number') return x;         // time scale이라면 이미 ms일 확률 높음
      const n = +x;
      if (isFinite(n) && String(x).trim() !== '') return n; // 숫자 문자열
      const p = Date.parse(x);
      return isFinite(p) ? p : NaN;
    };

    // 각 데이터셋에서 x에 해당하는 y를 선형보간 or 근사
    const yAtForDataset = (ds, xValue) => {
    	
    	
      const arr = ds.data;
      if (!Array.isArray(arr) || arr.length === 0) return null;

      // (x,y) 객체 배열인 경우 → 선형 보간
      if (typeof arr[0] === 'object') {
        const target = toMs(xValue);
        
        if (!isFinite(target)) return null;

        // 인접한 구간 찾기 (선형 스캔; 필요 시 이진탐색으로 교체 가능)
        let prev = null, next = null;
        for (let i = 0; i < arr.length; i++) {
          const p = arr[i];
          const px = toMs(p.x);
          console.log(" px : " + px + ", target : " + target);
          if (!isFinite(px)) continue;
          if (px <= target) prev = p;
          if (px >= target) { next = p; break; }
        }
        if (!prev && !next) return null;
        if (!prev) return +next.y;
        if (!next) return +prev.y;

        const x0 = toMs(prev.x), x1 = toMs(next.x);
        const y0 = +prev.y, y1 = +next.y;
        if (!isFinite(x0) || !isFinite(x1)) return null;
        if (x1 === x0) return y0;
        const t = (target - x0) / (x1 - x0);
        return y0 + t * (y1 - y0);
      }

      // labels + data 배열 구조(카테고리)일 때 → 가장 가까운 인덱스
      const labels = chart.data.labels || [];
      if (!Array.isArray(labels) || labels.length === 0) return null;
      const target = toMs(xValue);
      let bestIdx = 0, bestDiff = Infinity;
      for (let i = 0; i < labels.length; i++) {
        const lv = toMs(labels[i]);
        const diff = (isFinite(lv) && isFinite(target)) ? Math.abs(lv - target)
                                                       : (labels[i] === xValue ? 0 : Infinity);
        if (diff < bestDiff) { bestDiff = diff; bestIdx = i; }
      }
      const y = arr[bestIdx];
      return (y != null) ? +y : null;
    };

    // 스타일 준비
    ctx.save();
    ctx.font = '12px sans-serif';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';

    // 각 분할선마다 그리기
    xPixels.forEach((xPx, i) => {
      const xv = xValues[i];

      // 1) 수직 가이드선
      ctx.beginPath();
      ctx.setLineDash(dash);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.moveTo(xPx, chartArea.top);
      ctx.lineTo(xPx, chartArea.bottom);
      ctx.stroke();
      ctx.setLineDash([]);

      // 2) 각 데이터셋의 y 계산 + 텍스트 라인 구성
      const lines = [];
      let yForAnchorPx = null; // 박스 위치 기준 잡을 y픽셀 (첫 y축 값 기준)

      metas.forEach((meta) => {
        const ds = chart.data.datasets[meta.index];
        if (!ds) return;

        const yVal = yAtForDataset(ds, xv);
        if (yVal == null || !isFinite(yVal)) return;

        const yScaleId = ds.yAxisID || 'y';
        const yScale = scales[yScaleId] || scales.y || scales.yLeft || scales.yPrice || scales.yVolume;
        if (!yScale) return;

        const yPx = yScale.getPixelForValue(yVal);
        // 최초 박스 기준 y로 사용 (여러 y축 중 첫 번째)
        if (yForAnchorPx == null) yForAnchorPx = yPx;

        // 마커(작은 점)
        ctx.beginPath();
        const color = ds.borderColor || ds.backgroundColor || tipFg;
        ctx.fillStyle = typeof color === 'string' ? color : tipFg;
        ctx.arc(xPx, yPx, 3, 0, Math.PI * 2);
        ctx.fill();

        // 라벨 한 줄 구성: [색상 스와치] label: 값
        const label = ds.label ?? `DS${meta.index}`;
        const text = `${label}: ${yFormatter(yVal, ds, yScaleId)}`;
        lines.push({ text, color: ctx.fillStyle });
      });

      if (lines.length === 0) return;

      // 3) 툴팁 박스(여러 데이터셋 라인 포함)
      const xText = xFormatter(xv);
      const header = xText;

      // 헤더 + 라인들의 너비/높이 계산
      const sw = (t) => ctx.measureText(t).width;
      const lineGap = 14;
      const headerGap = 16;

      const headerW = sw(header);
      const linesW = Math.max(...lines.map(l => sw(l.text)));
      const textW = Math.max(headerW, linesW);
      const boxW = textW + tipPadding * 2 + 12; // 색상 스와치 여유
      const boxH = tipPadding * 2 + headerGap + lines.length * lineGap;

      const leftPref = xPx + 8 + boxW <= chartArea.right;
      const boxX = leftPref ? xPx + 8 : xPx - 8 - boxW;

      // 기준 y 픽셀 없으면 중앙
      let anchorY = (yForAnchorPx != null) ? yForAnchorPx : (chartArea.top + chartArea.height / 2);
      // 화면 밖 방지
      let boxY = anchorY - boxH / 2;
      if (boxY < chartArea.top + 4) boxY = chartArea.top + 4;
      if (boxY + boxH > chartArea.bottom - 4) boxY = chartArea.bottom - 4;

      // 둥근 박스
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

      // 텍스트: 헤더(날짜)
      ctx.fillStyle = tipFg;
      let ty = boxY + tipPadding;
      ctx.fillText(header, boxX + tipPadding, ty);
      ty += headerGap;

      // 텍스트: 각 데이터셋
      lines.forEach(l => {
        // 색상 스와치
        ctx.fillStyle = l.color || tipFg;
        ctx.fillRect(boxX + tipPadding, ty + 3, 8, 8);
        // 글자
        ctx.fillStyle = tipFg;
        ctx.fillText(l.text, boxX + tipPadding + 12, ty);
        ty += lineGap;
      });
    });

    ctx.restore();
  }
};