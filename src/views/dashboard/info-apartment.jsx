'use client';

import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

// material-ui

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Rating from '@mui/material/Rating';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

// react
import { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// project imports
import AiComponent from 'layout/DashboardLayout/AiComponent';
import { useContext } from 'react';
import { ChartImageHistoryContext } from 'layout/DashboardLayout/index';

// Dynamic import for ApexRebChart (SSR 방지)
const ApexRebChart = dynamic(() => import('sections/charts/apexchart/ApexRebChart'), {
  ssr: false,
  loading: () => <CircularProgress />
});


// ==============================|| DASHBOARD - INFO APARTMENT ||============================== //

export default function InfoApartment() {


  const [error, setError] = useState(null);
  // Context에서 chartImageHistory, setChartImageHistory 가져오기
  const { chartImageHistory, setChartImageHistory } = useContext(ChartImageHistoryContext);
  const [chartData, setChartData] = useState(null); // 초기에는 null로 설정
  const [chartLayers, setChartLayers] = useState([]); // 차트 레이어들을 누적 저장

  // Ref for ApexMixedChart
  const chartRef = useRef(null);

  // 조회 년도 범위 상태 (최근 10년, 올해 기준)
  const SLIDER_END_YEAR = new Date().getFullYear();
  const SLIDER_START_YEAR = SLIDER_END_YEAR - 9;
  const monthCount = (SLIDER_END_YEAR - SLIDER_START_YEAR) * 12 + 12; 
  const [yearRange, setYearRange] = useState([0, monthCount - 1]);


  // 예시 데이터 (실제 데이터로 교체 필요)
  const sidoOptions = ['서울특별시', '경기도', '인천광역시'];
  const gunguOptions = {
    '서울특별시': ['송파구', '강남구', '서초구'],
    '경기도': ['성남시', '수원시', '고양시'],
    '인천광역시': ['남동구', '연수구', '부평구']
  };
  const aptOptions = {
    '송파구': ['잠실 엘스 (서울특별시 송파구 주신로 19 롯데월드 99) 2008-09-30 / 5678세대', '잠실 리센츠', '잠실 파크리오'],
    '강남구': ['도곡렉슬', '개포래미안', '대치아이파크'],
    '서초구': ['반포자이', '서초푸르지오', '방배아트자이'],
    '남동구': ['논현푸르지오', '구월힐스테이트'],
    '연수구': ['송도더샵', '연수자이'],
    '부평구': ['부평삼성래미안', '부평아이파크']
  };
  const [selectedSido, setSelectedSido] = useState('서울특별시');
  const [selectedGungu, setSelectedGungu] = useState('송파구');
  const [selectedApt, setSelectedApt] = useState('선택하세요');
  
  // 매매/전세 및 평형 선택 상태
  const [selectedSaleType, setSelectedSaleType] = useState('매매'); // '매매' 또는 '전세'
  const [selectedArea, setSelectedArea] = useState(84); // 59, 84, 110, 124
  const [selectedMind, setSelectedMind] = useState(false); // 심리분석 선택 여부

  // 컴포넌트 마운트 시 히스토리 이미지 리셋
  useEffect(() => {
    // 페이지 진입 시 히스토리 이미지 리셋
    setChartImageHistory([]);
   // console.log('Chart image history reset on info-apartment page load');
  }, [setChartImageHistory]);

  // InfoApartment 함수 내에 추가
  const [sidoAnchor, setSidoAnchor] = useState(null);
  const [gunguAnchor, setGunguAnchor] = useState(null);
  const [aptAnchor, setAptAnchor] = useState(null);

  // 드롭다운 변경 핸들러
  const handleSidoChange = (e) => {
    const newSido = e.target.value;
    setSelectedSido(newSido);
    setSelectedGungu(gunguOptions[newSido][0]);
    setSelectedApt(aptOptions[gunguOptions[newSido][0]][0]);
  };
  const handleGunguChange = (e) => {
    const newGungu = e.target.value;
    setSelectedGungu(newGungu);
    setSelectedApt(aptOptions[newGungu][0]);
  };
  // 아파트 변경 핸들러
  const handleAptChange = async (e) => {
    const aptCode = e.target.value;
    setSelectedApt(aptCode);
    const data = await fetchChartData(aptCode, selectedSaleType, selectedArea, selectedMind);
    if (data) setChartData(data);
  };
  
  // 매매/전세 변경 핸들러
  const handleSaleTypeChange = async (saleType) => {
    setSelectedSaleType(saleType);
    if (selectedApt && selectedApt !== '선택하세요') {
      const data = await fetchChartData(selectedApt, saleType, selectedArea, selectedMind);
      if (data) setChartData(data);
    }
  };
  
  // 평형 변경 핸들러
  const handleAreaChange = async (area) => {
    setSelectedArea(area);
    if (selectedApt && selectedApt !== '선택하세요') {
      const data = await fetchChartData(selectedApt, selectedSaleType, area, selectedMind);
      if (data) setChartData(data);
    }
  };
  
  // 심리분석 버튼 클릭 핸들러
  const handleMindAnalysis = async () => {
    // 심리분석이 현재 꺼져있으면 켜고, 켜져있으면 끄기
    const willEnableMind = !selectedMind;

    // ApexRebChart 형식에 맞는 데이터 구조
    const dataList = {
      data: {
        labels: [
          '20240127', '20241006', '20241007', '20241008', '20241009', '20241010',
          '20241011', '20241012', '20241013', '20241014', '20241015', '20241016',
          '20241017', '20241018', '20241019', '20241020', '20241021', '20241022',
          '20241023', '20241024', '20241025', '20241026', '20241027', '20241028',
          '20241029', '20241030', '20241031', '20241101', '20241102', '20241103',
          '20241104', '20241105', '20241106', '20241107', '20241108', '20241109',
          '20241110', '20241111'
        ],
        datasets: [{
          name: '잠실엘스 심리분석',
          label: '잠실엘스 심리분석',
          data: [
            { x: '20240127', y: [128000, 135000, 125000, 132000] },
            { x: '20241006', y: [132000, 138000, 130000, 136000] },
            { x: '20241007', y: [136000, 140000, 134000, 138000] },
            { x: '20241008', y: [138000, 142000, 136000, 140000] },
            { x: '20241009', y: [140000, 143000, 138000, 141000] },
            { x: '20241010', y: [141000, 144000, 139000, 142000] },
            { x: '20241011', y: [142000, 145000, 140000, 143000] },
            { x: '20241012', y: [143000, 146000, 141000, 144000] },
            { x: '20241013', y: [144000, 147000, 142000, 145000] },
            { x: '20241014', y: [145000, 148000, 143000, 146000] },
            { x: '20241015', y: [146000, 149000, 144000, 147000] },
            { x: '20241016', y: [147000, 150000, 145000, 148000] },
            { x: '20241017', y: [148000, 151000, 146000, 149000] },
            { x: '20241018', y: [149000, 152000, 147000, 150000] },
            { x: '20241019', y: [150000, 153000, 148000, 151000] },
            { x: '20241020', y: [151000, 154000, 149000, 152000] },
            { x: '20241021', y: [152000, 155000, 150000, 153000] },
            { x: '20241022', y: [153000, 156000, 151000, 154000] },
            { x: '20241023', y: [154000, 157000, 152000, 155000] },
            { x: '20241024', y: [155000, 158000, 153000, 156000] },
            { x: '20241025', y: [156000, 159000, 154000, 157000] },
            { x: '20241026', y: [157000, 160000, 155000, 158000] },
            { x: '20241027', y: [158000, 161000, 156000, 159000] },
            { x: '20241028', y: [159000, 162000, 157000, 160000] },
            { x: '20241029', y: [160000, 163000, 158000, 161000] },
            { x: '20241030', y: [161000, 164000, 159000, 162000] },
            { x: '20241031', y: [162000, 165000, 160000, 163000] },
            { x: '20241101', y: [163000, 166000, 161000, 164000] },
            { x: '20241102', y: [164000, 167000, 162000, 165000] },
            { x: '20241103', y: [165000, 168000, 163000, 166000] },
            { x: '20241104', y: [166000, 169000, 164000, 167000] },
            { x: '20241105', y: [167000, 170000, 165000, 168000] },
            { x: '20241106', y: [168000, 171000, 166000, 169000] },
            { x: '20241107', y: [169000, 172000, 167000, 170000] },
            { x: '20241108', y: [170000, 173000, 168000, 171000] },
            { x: '20241109', y: [171000, 174000, 169000, 172000] },
            { x: '20241110', y: [172000, 175000, 170000, 173000] },
            { x: '20241111', y: [173000, 176000, 171000, 174000] }
          ]
        }]
      }
    }; 

    if (willEnableMind) {
      // 심리분석을 켤 때: 매물호가, 매물량, 실거래를 모두 끄고 심리분석만 켬
      setVisibleSeries({ 
        매물호가: false, 
        매물량: false, 
        실거래: false,
        심리분석: true
      });
      setSelectedMind(true);
      // 심리분석 차트 데이터 가져오기
      ///const data = await fetchChartData(selectedApt, selectedSaleType, selectedArea, true);
      ///하드코딩 데이터 - 아파트 선택 여부와 관계없이 설정
      setChartData(dataList);
    } else {
      // 심리분석을 끌 때: 매물호가, 매물량, 실거래를 모두 켜고 심리분석 끔
      setVisibleSeries({ 
        매물호가: true, 
        매물량: true, 
        실거래: true,
        심리분석: false
      });
      setSelectedMind(false);
      // 일반 차트 데이터 가져오기
      if (selectedApt && selectedApt !== '선택하세요') {
        const data = await fetchChartData(selectedApt, selectedSaleType, selectedArea, false);
        if (data) setChartData(data);
      }
    }
  };

  //  const server = "http://172.16.10.56:8087/RAP";
  const server = "http://127.0.0.1:8087/RAP";

  const fetchChartData = async (aptCode, saleType = '매매', area = 84, sMindAnalysis = false) => {
    try {
      setError(null);
      if (!aptCode) return;
      let stym = '202001';
      let edym = '202508';
  
      //SPRICE :매물호가
      //SCOUNT :매물량
      //SRTMS :실거래
      //SALE :매매/전세 (true: 매매, false: 전세)
      //SMIND :심리분석
      //AREA :평형값 (59, 84, 110, 124 등)
      //ST_YM=202001&ED_YM=202508&APT_CODE=20107304&AREA=84&SPRICE=true&SCOUNT=true&SRTMS=true&SALE=true&TITLE=잠실엘스

      // 매매/전세를 boolean으로 변환 (매매: true, 전세: false)
      const saleFlag = saleType === '매매' ? 'true' : 'false';

      let svcURL = '';
      //심리분석 캔들차트
      if (sMindAnalysis) {
        //svcURL = `/api/rap/getChart_APT?ST_YM=${stym}&ED_YM=${edym}&APT_CODE=20107304&AREA=84&TRADETYPECODE=A1`;
        //svcURL = `/api/rap/getChart_APT?ST_YM=${stym}&ED_YM=${edym}&APT_CODE=20107304&AREA=${area}&SPRICE=true&SCOUNT=true&SRTMS=true&SALE=${saleFlag}&TITLE=잠실엘스`;
        //하드코딩
        //svcURL = `/api/rap/getChart_APT?ST_YM=${stym}&ED_YM=${edym}&APT_CODE=20107304&AREA=84&TRADETYPECODE=A1`;
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=A_2024_00016&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합`;
      } else {
        svcURL = `/api/rap/getChart_APT?ST_YM=${stym}&ED_YM=${edym}&APT_CODE=20107304&AREA=84&SPRICE=true&SCOUNT=true&SRTMS=true&SALE=true&TITLE=잠실엘스`;
      }
      console.log('🔗 API 호출 URL:', svcURL);

      const response = await fetch(svcURL, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!response.ok) throw new Error(`API 호출 실패 (${response.status}): ${response.statusText}`);
      const data = await response.json();
      console.log('Chart data received:', data);
      
      return data;
    } catch (err) {
      setError(`연결 오류: ${err.message}. 서버가 실행 중인지 확인해주세요.`);
      return null;
    }
  };


  // 탭 상태
  const [tabValue, setTabValue] = useState(0);

  // 정책자료 테이블 데이터 (하드코딩, API 연동)
  const policyData = [
    {
      date: '20240127',
      title: '(24.01.27) 가계부채 관리 강화 방안',
      desc: 'LTV 등 규제 강화 / 가계대출 총량관리 강화 / 은행의 자율관리책자 추출 / 주요권으로 혹내 시행 / 추가대상명칭 추진선별 적용'
    },
    {
      date: '20230529',
      title: '(23.05.29) 금융 · 통화',
      desc: '한국은행 기준금리 인하'
    },
    {
      date: '20220521',
      title: '(22.05.21) 가계부채 관리화',
      desc: "3단계 스트레스 DSR 시행('25.7.1~)"
    },
    {
      date: '20200520',
      title: '(20.05.20) 가계대출규제 · DSR',
      desc: '3단계 스트레스 DSR 시행'
    },
    {
      date: '20250520',
      title: '(25.05.20) 전세시기 비례 지원',
      desc: '전세시기대체 지원 및 주기업집에 관한 특별법 일부개정'
    },
    {
      date: '20250319',
      title: '(25.03.19) 주택시장 안정화 방안',
      desc: '금융 · 가계대출 관리 강화 / 주거안정지역 · 부가처별지구 지정 긴드 / 주택공급 기간 강화 / 주택시장 거래질서 확립 / 주저기업 기간 강화 / 주택시장 거래질서기등'
    }
  ];

  // 체크된 정책자료 상태 관리
  const [checkedPolicies, setCheckedPolicies] = useState([]); // [{date, title, desc}]

  // 차트 시리즈 토글 상태 관리 (매물호가, 매물량, 실거래, 심리분석)
  const [visibleSeries, setVisibleSeries] = useState({
    매물호가: true,
    매물량: true,
    실거래: true,
    심리분석: false
  });

  // 체크박스 변경 핸들러
  const handlePolicyCheck = (idx) => {
    setCheckedPolicies((prev) => {
      const exists = prev.find((p) => p.date === policyData[idx].date && p.title === policyData[idx].title);
      if (exists) {
        return prev.filter((p) => !(p.date === policyData[idx].date && p.title === policyData[idx].title));
      } else {
        return [...prev, policyData[idx]];
      }
    });
  };

  // 시리즈 토글 핸들러
  const handleSeriesToggle = async (seriesName) => {
    // 매물호가, 매물량, 실거래 중 하나라도 클릭되면 심리분석은 자동으로 꺼짐
    if (['매물호가', '매물량', '실거래'].includes(seriesName)) {
      const wasMindActive = visibleSeries.심리분석;
      
      setVisibleSeries((prev) => ({
        ...prev,
        [seriesName]: !prev[seriesName],
        심리분석: false
      }));
      
      // 심리분석이 활성화되어 있었다면, 일반 차트 데이터를 다시 로드
      if (wasMindActive) {
        setSelectedMind(false);
        if (selectedApt && selectedApt !== '선택하세요') {
          const data = await fetchChartData(selectedApt, selectedSaleType, selectedArea, false);
          if (data) setChartData(data);
        }
      }
    }
  };

  return (
    <Box sx={{ display: 'flex', height: '90vh', width: '100%' }}>
      <Box sx={{ flex: 1, overflow: 'auto', height: '90vh' }}>
        {/* 조회 년도 범위 (사용자 조정 가능) */}
        <Box sx={{ p: 2, pb: 0 }}>
          <Grid container alignItems="center" justifyContent="flex-start" sx={{ m: 0 }}>
            <Grid sx={{ pl: 0, ml: 0 }}>
              <Typography variant="h5" sx={{ pl: 0, ml: 0 }}>조회 년도 범위
                <Typography variant="caption" color="text.secondary">{
                  (() => {
                    const y = SLIDER_START_YEAR + Math.floor(yearRange[0] / 12);
                    const m = (yearRange[0] % 12) + 1;
                    return ` [ ${y}년${String(m).padStart(2,'0')}월`;
                  })()
                }</Typography>
                <Typography variant="caption" color="text.secondary">{
                  (() => {
                    const y = SLIDER_START_YEAR + Math.floor(yearRange[1] / 12);
                    const m = (yearRange[1] % 12) + 1;
                    return `~ ${y}년${String(m).padStart(2,'0')}월 ]`;
                  })()
                }</Typography>
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '90%', justifyContent: 'center', margin: '0 auto' }}>
            <Slider
              value={yearRange}
              min={0}
              max={monthCount - 1}
              step={1}
              valueLabelDisplay="auto"
              sx={{ flex: 1, height: 8,
                '& .MuiSlider-thumb': { width: 24, height: 24 },
                '& .MuiSlider-track': { height: 8 },
                '& .MuiSlider-rail': { height: 8 },
                mt: 2, mb: 2
              }}
              onChange={(e, newValue) => setYearRange(newValue)}
              marks={(() => {
                const marks = [];
                for(let i=0; i<monthCount; i++) {
                    const year = SLIDER_START_YEAR + Math.floor(i/12);
                  const month = (i%12)+1;
                  if(month === 1 || i === monthCount-1) {
                    marks.push({ value: i, label: `${year}-${String(month).padStart(2,'0')}` });
                  }
                }
                return marks;
              })()}
              getAriaValueText={v => {
                const year = SLIDER_START_YEAR + Math.floor(v/12);
                const month = (v%12)+1;
                return `${year}년${String(month).padStart(2,'0')}월`;
              }}
              valueLabelFormat={v => {
                const year = SLIDER_START_YEAR + Math.floor(v/12);
                const month = (v%12)+1;
                return `${year}년${String(month).padStart(2,'0')}월`;
              }}
            />
            
          </Box>
        </Box>
        <Grid container rowSpacing={1.3} columnSpacing={1} sx={{ p: 0, pt: 0 }}>
          {/* row 1 - 아파트 정보 선택 (Mantis UI 스타일) */}
          <Box sx={{ width: '100%', mt: 3, mb: 2 }}>
            {/* 첨부 이미지 스타일: 시도/군구/아파트 선택 박스 */}
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mx: 'auto', mt: 2, mb: 1 }}>
              {/* 시도 */}
              <Box
                sx={{
                  px: 2, py: 0.5,
                  bgcolor: '#e0e0e0',
                  color: '#444',
                  fontWeight: 500,
                  fontSize: 14,
                  borderTopLeftRadius: 1,
                  borderBottomLeftRadius: 1,
                  cursor: 'pointer',
                  minWidth: 100,
                  textAlign: 'center',
                  borderRight: '2px solid #fff',
                  transition: 'background 0.2s'
                }}
                onClick={e => setSidoAnchor(e.currentTarget)}
              >
                {selectedSido}
              </Box>
              {/* 군구 */}
              <Box
                sx={{
                  px: 2, py: 0.5,
                  bgcolor: '#f5f5f5',
                  color: '#444',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  minWidth: 100,
                  textAlign: 'center',
                  borderRight: '2px solid #fff',
                  transition: 'background 0.2s'
                }}
                onClick={e => setGunguAnchor(e.currentTarget)}
              >
                {selectedGungu}
              </Box>
              {/* 아파트 */}
              <Box
                sx={{
                  px: 2, py: 0.5,
                  bgcolor: '#1976d2',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: 14,
                  borderTopRightRadius: 1,
                  borderBottomRightRadius: 1,
                  cursor: 'pointer',
                  flex: 1,
                  textAlign: 'left',
                  position: 'relative',
                  boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.08)'
                }}
                onClick={e => setAptAnchor(e.currentTarget)}
              >
                {selectedApt}
              </Box>
              {/* 드롭다운 메뉴 */}
              <Menu anchorEl={sidoAnchor} open={Boolean(sidoAnchor)} onClose={() => setSidoAnchor(null)}>
                {sidoOptions.map(sido => (
                  <MenuItem key={sido} value={sido} onClick={() => { handleSidoChange({ target: { value: sido } }); setSidoAnchor(null); }}>{sido}</MenuItem>
                ))}
              </Menu>
              <Menu anchorEl={gunguAnchor} open={Boolean(gunguAnchor)} onClose={() => setGunguAnchor(null)}>
                {(gunguOptions[selectedSido] || []).map(gungu => (
                  <MenuItem key={gungu} value={gungu} onClick={() => { handleGunguChange({ target: { value: gungu } }); setGunguAnchor(null); }}>{gungu}</MenuItem>
                ))}
              </Menu>
              <Menu anchorEl={aptAnchor} open={Boolean(aptAnchor)} onClose={() => setAptAnchor(null)}>
                {(aptOptions[selectedGungu] || []).map(apt => (
                  <MenuItem key={apt} value={apt} onClick={() => { handleAptChange({ target: { value: apt } }); setAptAnchor(null); }}>{apt}</MenuItem>
                ))}
              </Menu>
            </Box>
            {/* 버튼들 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, flexWrap: 'wrap', width: '100%', mx: 'auto' }}>
              {/* 매매/전세/평형 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ButtonGroup variant="contained" sx={{ boxShadow: 'none', height: 28 }}>
                  <Button 
                    sx={{ 
                      bgcolor: selectedSaleType === '매매' ? '#222' : '#aaa', 
                      color: '#fff', 
                      minWidth: 48, 
                      px: 2, 
                      py: 0.3, 
                      fontSize: 13, 
                      '&:hover': { bgcolor: selectedSaleType === '매매' ? '#444' : '#888' } 
                    }}
                    onClick={() => handleSaleTypeChange('매매')}
                  >
                    매매
                  </Button>
                  <Button 
                    sx={{ 
                      bgcolor: selectedSaleType === '전세' ? '#222' : '#aaa', 
                      color: '#fff', 
                      minWidth: 48, 
                      px: 2, 
                      py: 0.3, 
                      fontSize: 13, 
                      '&:hover': { bgcolor: selectedSaleType === '전세' ? '#444' : '#888' } 
                    }}
                    onClick={() => handleSaleTypeChange('전세')}
                  >
                    전세
                  </Button>
                </ButtonGroup>
                <ButtonGroup variant="outlined" sx={{ ml: 1, height: 28 }}>
                  <Button 
                    sx={{ 
                      minWidth: 56, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13, 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      bgcolor: selectedArea === 59 ? '#e3f0ff' : 'transparent',
                      fontWeight: selectedArea === 59 ? 700 : 400
                    }}
                    onClick={() => handleAreaChange(59)}
                  >
                    59㎡
                  </Button>
                  <Button 
                    sx={{ 
                      minWidth: 56, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13, 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      bgcolor: selectedArea === 84 ? '#e3f0ff' : 'transparent',
                      fontWeight: selectedArea === 84 ? 700 : 400
                    }}
                    onClick={() => handleAreaChange(84)}
                  >
                    84㎡
                  </Button>
                  <Button 
                    sx={{ 
                      minWidth: 56, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13, 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      bgcolor: selectedArea === 110 ? '#e3f0ff' : 'transparent',
                      fontWeight: selectedArea === 110 ? 700 : 400
                    }}
                    onClick={() => handleAreaChange(110)}
                  >
                    110㎡
                  </Button>
                  <Button 
                    sx={{ 
                      minWidth: 56, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13, 
                      borderColor: '#1976d2', 
                      color: '#1976d2',
                      bgcolor: selectedArea === 124 ? '#e3f0ff' : 'transparent',
                      fontWeight: selectedArea === 124 ? 700 : 400
                    }}
                    onClick={() => handleAreaChange(124)}
                  >
                    124㎡
                  </Button>
                </ButtonGroup>
              </Box>
              {/* 매물호가/매물량/실거래 */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ButtonGroup variant="outlined" sx={{ height: 28 }}>
                  <Button 
                    sx={{ 
                      minWidth: 80, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13,
                      bgcolor: visibleSeries.매물호가 ? '#1976d2' : 'transparent',
                      color: visibleSeries.매물호가 ? '#fff' : '#1976d2',
                      borderColor: '#1976d2',
                      '&:hover': {
                        bgcolor: visibleSeries.매물호가 ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                        borderColor: '#1976d2'
                      }
                    }}
                    onClick={() => handleSeriesToggle('매물호가')}
                  >
                    매물호가
                  </Button>
                  <Button 
                    sx={{ 
                      minWidth: 80, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13,
                      bgcolor: visibleSeries.매물량 ? '#1976d2' : 'transparent',
                      color: visibleSeries.매물량 ? '#fff' : '#1976d2',
                      borderColor: '#1976d2',
                      '&:hover': {
                        bgcolor: visibleSeries.매물량 ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                        borderColor: '#1976d2'
                      }
                    }}
                    onClick={() => handleSeriesToggle('매물량')}
                  >
                    매물량
                  </Button>
                  <Button 
                    sx={{ 
                      minWidth: 80, 
                      px: 1.5, 
                      py: 0.3, 
                      fontSize: 13,
                      bgcolor: visibleSeries.실거래 ? '#1976d2' : 'transparent',
                      color: visibleSeries.실거래 ? '#fff' : '#1976d2',
                      borderColor: '#1976d2',
                      '&:hover': {
                        bgcolor: visibleSeries.실거래 ? '#1565c0' : 'rgba(25, 118, 210, 0.04)',
                        borderColor: '#1976d2'
                      }
                    }}
                    onClick={() => handleSeriesToggle('실거래')}
                  >
                    실거래
                  </Button>
                </ButtonGroup>
                <Button
                  variant={visibleSeries.심리분석 ? "contained" : "outlined"}
                  sx={{
                    ml: 1.5,
                    height: 28,
                    bgcolor: visibleSeries.심리분석 ? '#df8c10ff' : '#fff',
                    color: visibleSeries.심리분석 ? '#fff' : '#df8c10ff',
                      borderColor: '#df8c10ff',
                      fontWeight: 700,
                      fontSize: 13,
                      px: 2.5,
                      boxShadow: 'none',
                      borderRadius: 1,
                      '&:hover': { 
                        bgcolor: visibleSeries.심리분석 ? '#fcaa30ff' : 'rgba(223, 140, 16, 0.04)',
                        borderColor: '#df8c10ff'
                      }
                    }}
                    onClick={handleMindAnalysis}
                  >
                    심리분석
                  </Button>
              </Box>
            </Box>
          </Box>
          {/* row 2 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }} sx={{ mt: 0 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Typography variant="h5" sx={{ pl: 0, ml: 0 }}>그래프</Typography>
            </Grid>
            <Box sx={{ position: 'relative' }}>
              {/* fetchChartData 결과 전달 */}
              {chartData ? (
                <ApexRebChart
                  key={JSON.stringify(checkedPolicies) + JSON.stringify(visibleSeries)}
                  chartData={chartData} 
                  ref={chartRef}
                  policyAnnotations={checkedPolicies}
                  visibleSeries={visibleSeries}
                />
              ) : (
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%)',
                    boxShadow: '0 4px 24px 0 rgba(33, 150, 243, 0.10)',
                    p: 1
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{
                      color: '#fff',
                      fontWeight: 700,
                      letterSpacing: 1,
                      position: 'absolute',
                      top: 24,
                      left: 32,
                      m: 0,
                      p: 0
                    }}
                  >
                    한국부동산원 AI 분석 플랫폼
                  </Typography>
                </Box>
              )}

              {/* 차트 하단 버튼들 */}
              <Box sx={{ 
                mt: 2, 
                display: 'flex', 
                gap: 1.0, 
                justifyContent: 'flex-end',
                width: '100%'
              }}>
                <button 
                  onClick={() => {
                    // 차트 초기화 기능
                    setChartLayers([]);
                    setChartData(null);
                    setSelectedMind(false); // 심리분석 비활성화
                    setVisibleSeries({
                      매물호가: true,
                      매물량: true,
                      실거래: true,
                      심리분석: false
                    });
                    console.log('차트 초기화 완료');
                  }}
                  style={{
                    padding: '6px 16px', // 패딩 줄임
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px', // 폰트 크기 줄임
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#c82333'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc3545'}
                >
                  차트 초기화
                </button>
                
                <button 
                  onClick={async () => {
                    // 차트가 렌더링된 후에만 이미지 추출
                    if (
                      chartRef.current &&
                      chartData &&
                      chartData.data &&
                      Array.isArray(chartData.data.datasets) &&
                      chartData.data.datasets.length > 0 
                    ) {
                      // 강제 리렌더링용 dummy state
                      setChartData(prev => ({ ...prev, _force: Math.random() }));
                      await new Promise(res => setTimeout(res, 50)); // 리렌더링 대기
                      let chartId = selectedApt;
                      const imgURI = await chartRef.current.exportToImage();
                      if (imgURI) {
                        let uri = imgURI;
                        let ext = 'svg';
                        if (imgURI.startsWith('<svg')) {
                          // SVG 문자열을 Blob으로 변환 후 Object URL 생성
                          const svgBlob = new Blob([imgURI], { type: 'image/svg+xml' });
                          uri = URL.createObjectURL(svgBlob);
                          ext = 'svg';
                        } else if (imgURI.startsWith('data:image/png')) {
                          ext = 'png';
                        }
                        setChartImageHistory(prev => {
                          const uuid = uuidv4();
                          const next = [{ uri, ext, date: new Date().toISOString(), chartId, uuid }, ...prev];
                          //console.log('chartImageHistory updated:', next);
                          return next;
                        });
                      } else {
                        alert('이미지 생성에 실패했습니다.');
                      }
                    } else {
                      alert('아파트를 선택하여 그래프를 먼저 생성해 주세요.');
                    }
                  }}
                  style={{
                    padding: '6px 16px', // 패딩 줄임
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '13px', // 폰트 크기 줄임
                    fontWeight: '500'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
                >
                  AI 분석
                </button>
              </Box>
            </Box>
          </Grid>
          {/* row 3 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }} sx={{ mt: 0 }}>
            {/* 정책자료/차트 이미지 탭 */}
            <Box sx={{ width: '100%', p: 0, m: 0 }}>
              <Tabs
                value={tabValue}
                onChange={(e, v) => setTabValue(v)}
                aria-label="차트 히스토리 및 정책자료 탭"
                sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 36, p: 0, m: 0 }}
              >
                <Tab label="히스토리" sx={{ minHeight: 34, p: 0.5, m: 0 }} />
                <Tab label="정책자료" sx={{ minHeight: 34, p: 0, m: 0 }} />
              </Tabs>
              <Box sx={{ p: 1.2, pt: 0, mt: 0 }}>
                {tabValue === 0 && (
                  <>
                    {chartImageHistory.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto' }}>
                        {chartImageHistory.map((img, idx) => {
                          const src = img.uri || img;
                          const ext = img.ext || (src.startsWith('data:image/png') ? 'png' : 'svg');
                          const fileName = `chart_${img.uuid || 'chart'}_${idx + 1}.${ext}`;
                          return (
                            <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'background.default', minWidth: 260, maxWidth: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <a href={src} download={fileName} style={{ width: '100%', display: 'block' }} title="차트 이미지 다운로드">
                                <img src={src} alt={`Chart history ${idx + 1}`} style={{ width: '100%', maxHeight: 260, objectFit: 'contain', cursor: 'pointer' }} />
                              </a>
                            </Box>
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">AI분석 차트 이미지가 없습니다.</Typography>
                    )}
                  </>
                )}
                {tabValue === 1 && (
                  <>
                    <Box sx={{ overflow: 'auto', background: '#fff', borderRadius: 1 }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>선택</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>날짜</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'left' }}>제목</th>
                          </tr>
                        </thead>
                        <tbody>
                          {policyData.map((row, idx) => {
                            // 날짜 포맷팅 함수 (YYYYMMDD → YYYY-MM-DD)
                            const formatDate = (dateStr) => {
                              if (!dateStr || dateStr.length !== 8) return dateStr;
                              const year = dateStr.substring(0, 4);
                              const month = dateStr.substring(4, 6);
                              const day = dateStr.substring(6, 8);
                              return `${year}-${month}-${day}`;
                            };
                            
                            return (
                              <tr key={row.date + row.title}>
                                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                  <input
                                    type="checkbox"
                                    checked={!!checkedPolicies.find((p) => p.date === row.date && p.title === row.title)}
                                    onChange={() => handlePolicyCheck(idx)}
                                  />
                                </td>
                                <td style={{ padding: '6px', border: '1px solid #ddd' }}>{formatDate(row.date)}</td>
                                <td style={{ padding: '6px', border: '1px solid #ddd' }}>
                                  {row.title}<br/>
                                  <small style={{ color: '#666' }}>{row.desc}</small>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </Box>
                  </>
                )}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
