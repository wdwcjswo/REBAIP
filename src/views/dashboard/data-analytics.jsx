'use client';

import { useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import dynamic from 'next/dynamic';

// material-ui
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Slider from '@mui/material/Slider';

// react
import { useState, useEffect } from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

// project imports
import AnalyticsDataCard from 'components/cards/statistics/AnalyticsDataCard';
import { useContext } from 'react';
import { ChartImageHistoryContext } from 'layout/DashboardLayout/index';

// Dynamic import for ApexCharts (SSR 방지)
const ApexMixedChart = dynamic(() => import('sections/charts/apexchart/ApexMixedChart'), {
  ssr: false,
  loading: () => <CircularProgress />
});


// ==============================|| DASHBOARD - DATA ANALYTICS ||============================== //

export default function DashboardDataAnalytics() {
  // Context에서 chartImageHistory, setChartImageHistory 가져오기
  const { chartImageHistory, setChartImageHistory } = useContext(ChartImageHistoryContext);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([
    { selected: false, color: '#1976d2' },
    { selected: false, color: '#2e7d32' },
    { selected: false, color: '#d32f2f' }
  ]);
  const [chartData, setChartData] = useState(null); 
  const [chartLayers, setChartLayers] = useState([]); // 차트 레이어들을 누적 저장

  // 카드별 고정 색상 배열 (차트 색상용)
  const fixedColors = ['#1976d2', '#2e7d32', '#d32f2f'];
  
  // Ref for ApexMixedChart
  const chartRef = useRef(null);
  // 조회 년도 범위 상태 (최근 10년, 올해 기준)
  const SLIDER_END_YEAR = new Date().getFullYear();
  const SLIDER_START_YEAR = SLIDER_END_YEAR - 9;
  const monthCount = (SLIDER_END_YEAR - SLIDER_START_YEAR) * 12 + 12;
  const [yearRange, setYearRange] = useState([0, monthCount - 1]);

  // 카드 리셋 핸들러
  const handleResetCard = (cardIndex) => {
    setCards(prevCards =>
      prevCards.map((card, index) =>
        index === cardIndex ? { selected: false } : card
      )
    );
    console.log(`카드 ${cardIndex + 1} 리셋됨`);
  };

  // 카드별 옵션1 변경 핸들러
  const handleCardOption1Change = (cardIndex, newOption1) => {
    console.log(`카드 ${cardIndex} - 선택된 옵션1:`, newOption1);
    setCards(prevCards =>
      prevCards.map((card, idx) =>
        idx === cardIndex ? { ...card, option1: newOption1 } : card
      )
    );
  };
  // 카드별 옵션2 변경 핸들러
  const handleCardOption2Change = (cardIndex, newOption2) => {
    console.log(`카드 ${cardIndex} - 선택된 옵션2:`, newOption2);
    setCards(prevCards =>
      prevCards.map((card, idx) =>
        idx === cardIndex ? { ...card, option2: newOption2 } : card
      )
    );
  };

  // 각 카드의 차트 데이터를 가져오는 함수 (카드별로 독립적인 데이터 관리)
  // yearRange(슬라이더) 범위에 맞춰 미니차트 데이터 전달
  const getCardChartData = (statblid, cardIndex) => {
    const layer = chartLayers.find(layer => layer.statblid === statblid);
    if (layer && layer.data && layer.data.datasets && layer.data.datasets.length > 0) {
      const labels = layer.data.labels || [];
      // yearRange: [startIdx, endIdx] (월 단위 인덱스)
      const SLIDER_START_YEAR = new Date().getFullYear() - 9;
      const getDateStr = idx => {
        const year = SLIDER_START_YEAR + Math.floor(idx / 12);
        const month = (idx % 12) + 1;
        return `${year}-${String(month).padStart(2, '0')}`;
      };
      const startDate = getDateStr(yearRange[0]);
      const endDate = getDateStr(yearRange[1]);
      // labels에서 범위에 해당하는 날짜만 추출
      const filteredLabels = labels.filter(label => label >= startDate && label <= endDate);

      // 해당 범위의 데이터만 반환
      const fullData = layer.data.datasets[0].data || [];
      return fullData.filter(item => filteredLabels.includes(item.x));
    }
    return [];
  };
  
  // 카드별 옵션1/옵션2 하드코딩 함수
  function getCardOptions(statblid) {
    if (statblid === 'A_2024_00045') {
      // 매매가격지수 아파트: 지역 + 평형
      return {
        option1Options: [
          '전국', '수도권', '지방권', '6대광역시', '5대광역시', '9개도', '8개도',
          '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
          '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
        ],
        option2Options: [
          '전체', '60㎡ 이하', '60㎡ 초과 85㎡ 이하', '85㎡ 초과'
        ]
      };
    } else if (statblid === 'A_2024_00903') {
      // 지역별 지가변동률: 평형만
      return {
        option1Options: [],
        option2Options: [
          '전체', '60㎡ 이하', '60㎡ 초과 85㎡ 이하', '85㎡ 초과'
        ]
      };
    } else if (statblid === 'T236933129926065') {
      // 발주자공종별%20건설수주액(경상)
      return {
        option1Options: [
          '수주총액', '공공부문', '민간부문', '국내외국기관'
        ],
        option2Options: [
          '계', '건축', '토목', '건축>주택'
        ]
      };
    } else {
      // 기타: 지역만
      return {
        option1Options: [
          '전국', '수도권', '지방권', '6대광역시', '5대광역시', '9개도', '8개도',
          '서울', '경기', '인천', '부산', '대구', '광주', '대전', '울산', '세종',
          '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주'
        ],
        option2Options: []
      };
    }
  }

  //  const server = "http://172.16.10.56:8087/RAP";
  const server = "http://127.0.0.1:8087/RAP";

  // fetchChartData 함수를 독립적으로 분리 (카드별로 독립적인 데이터 관리)
  const fetchChartData = async (statblid, cardIndex) => {
    try {
      setError(null);

      // statblid가 없으면 함수 종료
      if (!statblid) {
        console.log('fetchChartData: statblid가 제공되지 않음');
        return;
      }

      // cardIndex가 없으면 -1로 설정 (기본 차트용)
      if (cardIndex === undefined) {
        cardIndex = -1;
      }

      // API 파라미터 상수
      const START_YM = 202001;
      const END_YM = 202509;
      const GRP_ID = null;

      // 카드의 옵션값 가져오기
      const card = cards[cardIndex];
      // 옵션2(평형) 값에 따라 CLS_DATANO 결정 (예시: CLS_DATANO 값 하드코딩)
      let CLS_DATANO = '50002'; // 기본값
      if (statblid === 'A_2024_00045') {
        // 매매가격지수 아파트
        if (card?.option2 === '전체') CLS_DATANO = '500007';
        else if (card?.option2 === '60㎡ 이하') CLS_DATANO = '500008';
        else if (card?.option2 === '60㎡ 초과 85㎡ 이하') CLS_DATANO = '500009';
        else if (card?.option2 === '85㎡ 초과') CLS_DATANO = '500010';
      } else if (statblid === 'A_2024_00016') {
        // 매매가격지수 주택종합
        CLS_DATANO = '500017';
      } else if (statblid === 'A_2024_00903') {
        // 지역별 지가변동률
        CLS_DATANO = '500001';
      } else if (statblid === 'T236933129926065') {
        // 발주자공종별 건설수주액(경상)
        CLS_DATANO = card?.option2 === '건축>주택' ? '50003' : '50002';
      }
  
      //STATBL_ID=A_2024_00016&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합
      //STATBL_ID=A_2024_00045&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트
      //STATBL_ID=A_2024_00050&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트
      //STATBL_ID=A_2024_00903&ST_YM=202001&ED_YM=202509&GRP_ID=null&CLS_ID=1000010&CLS_DATANO=500001&TITLE=지역별 지가변동률
      //STATBL_ID=T236933129926065&ST_YM=202001&ED_YM=2035&GRP_ID=30008142&CLS_ID=30009164&CLS_DATANO=50002&TITLE=발주자공종별%20건설수주액(경상)
      //STATBL_ID=T236933129926065&ST_YM=202001&ED_YM=2035&GRP_ID=30008142&CLS_ID=30009164&CLS_DATANO=50002&TITLE=발주자공종별

      let svcURL = '';
    
      //지수
      if (statblid === 'A_2024_00016') { // 매매가격지수 주택종합
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=${statblid}&ST_YM=${START_YM}&ED_YM=${END_YM}&GRP_ID=${GRP_ID}&CLS_ID=51000000&CLS_DATANO=500017&TITLE=매매가격지수 주택종합`;
      } else if (statblid === 'A_2024_00045') { // 매매가격지수 아파트
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=${statblid}&ST_YM=${START_YM}&ED_YM=${END_YM}&GRP_ID=${GRP_ID}&CLS_ID=1000070&CLS_DATANO=500007&TITLE=매매가격지수 아파트`;
      } else if (statblid === 'A_2024_00050') { // 전세가격지수 아파트
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=${statblid}&ST_YM=${START_YM}&ED_YM=${END_YM}&GRP_ID=${GRP_ID}&CLS_ID=1000010&CLS_DATANO=500001&TITLE=전세가격지수 아파트`;
      
      //변동률
      } else if (statblid === 'A_2024_00903') { // 지역별 지가변동률
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=${statblid}&ST_YM=${START_YM}&ED_YM=${END_YM}&GRP_ID=${GRP_ID}&CLS_ID=1000010&CLS_DATANO=500001&TITLE=지역별 지가변동률`;
      
      //퍼센트
      } else if(statblid === "KTECH_RENT_01") { // 전세가율 - 아파트 (최근 1년)
        svcURL = "/getKTECHRENTList?OPT=OPT1";
      } else if(statblid === "KTECH_RENT_02") { // 전세가율 - 아파트 (최근 3개월)
        svcURL = "/getKTECHRENTList?OPT=OPT2";
      } else if(statblid === "KTECH_RENT_03") { // 전세가율 - 연립/다세대 (최근 1년)
        svcURL = "/getKTECHRENTList?OPT=OPT3";
      } else if(statblid === "KTECH_RENT_04") { // 전세가율 - 연립/다세대 (최근 3개월)
        svcURL = "/getKTECHRENTList?OPT=OPT4";
       
      //건수  
      } else if(statblid === "KTECH_SURETY_01") { // 보증사고현황 - 사고건수
        svcURL = "/getKTECHSURETYList?OPT=OPT1";
      
      //금액  STATBL_ID=T236933129926065&ST_YM=202001&ED_YM=2035&GRP_ID=30008142&CLS_ID=30009164&CLS_DATANO=50002&TITLE=발주자공종별
      } else if(statblid === "T236933129926065") { // 발주자공종별%20건설수주액(경상)
        svcURL = `/api/rap/getChart_RONE_OPT?STATBL_ID=${statblid}&ST_YM=202001&ED_YM=2035&GRP_ID=30008142&CLS_ID=30009164&CLS_DATANO=${CLS_DATANO}&TITLE=발주자공종별`;
      } else if(statblid === "KTECH_SURETY_02") { // 보증사고현황 - 사고금액
        svcURL = "/getKTECHSURETYList?OPT=OPT2";
      } else if(statblid === "KTECH_SURETY_03") { // 보증사고현황 - 사고율
        svcURL = "/getKTECHSURETYList?OPT=OPT3";
      } else if(statblid === "KTECH_AUCTION_01") { // 경매낙찰 통계 - 경매건수
        svcURL = "/getKTECHAUCTIONList?OPT=OPT1";
      } else if(statblid === "KTECH_AUCTION_02") { // 경매낙찰 통계 - 낙찰건수
        svcURL = "/getKTECHAUCTIONList?OPT=OPT2";
      } else if(statblid === "KTECH_AUCTION_03") { // 매낙찰 통계 - 낙찰률
        svcURL = "/getKTECHAUCTIONList?OPT=OPT3";
      } else if(statblid === "KTECH_AUCTION_04") { // 경매낙찰 통계 - 낙찰가율
        svcURL = "/getKTECHAUCTIONList?OPT=OPT4";
      }
      
      // console.log('fetchChartData called with statblid:', statblid);
      console.log('API URL:', svcURL);

      // Next.js 프록시를 통해 API 호출
      const response = await fetch(svcURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        }
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`API 호출 실패 (${response.status}): ${response.statusText}`);
      }

      const rawData = await response.json();
      //console.log('Chart data received:', rawData);

      // yyyymm 문자열을 yyyy-mm로 변환하는 헬퍼 함수
      const toDateString = (yyyymm) => {
        if (!yyyymm) return '';
        const str = String(yyyymm);
        if (str.length !== 6) return str;
        const year = str.substring(0, 4);
        const month = str.substring(4, 6);
        return `${year}-${month}`;
      };

      // API 응답 데이터의 datasets 내 data의 x값도 yyyy-mm 문자열로 변환
      if (rawData?.data?.datasets && Array.isArray(rawData.data.datasets)) {
        rawData.data.datasets = rawData.data.datasets.map(dataset => {
          if (Array.isArray(dataset.data)) {
            dataset.data = dataset.data.map(item => {
              if (item && typeof item === 'object' && 'x' in item) {
                return {
                  ...item,
                  x: toDateString(item.x)
                };
              }
              return item;
            });
          }
          return dataset;
        });
      }
      // API 응답 데이터의 labels를 yyyy-mm 문자열로 변환
      if (rawData?.data?.labels && Array.isArray(rawData.data.labels)) {
        rawData.data.labels = rawData.data.labels.map(toDateString);
      }

      console.log('Chart data after conversion:', rawData);

      // 새로운 레이어 추가
      setChartLayers(prevLayers => {
        const existingIndex = prevLayers.findIndex(layer => layer.statblid === statblid);
        let newLayers;
        
        if (existingIndex >= 0) {
          // 같은 statblid가 있으면 교체
          newLayers = [...prevLayers];
          newLayers[existingIndex] = { 
            ...rawData, 
            statblid: statblid
          };
          //console.log('Updated existing layer for statblid:', statblid);
        } else {
          // 새로운 레이어 추가
          newLayers = [...prevLayers, { 
            ...rawData, 
            statblid: statblid
          }];
          //console.log('Added new layer for statblid:', statblid);
        }
        
        // 메인 차트 데이터 병합
        const mergedChartData = mergeChartLayers(newLayers);
        setChartData(mergedChartData);
        
        return newLayers;
      });

    } catch (err) {
      console.error('API 호출 오류 상세:', err);
      setError(`연결 오류: ${err.message}. 서버가 실행 중인지 확인해주세요.`);
    }
  };

  // 여러 차트 레이어를 병합하는 함수
  const mergeChartLayers = (layers) => {
    if (!layers || layers.length === 0) return null;
    const mergedData = {
      data: { datasets: [] },
      labels: [],
      options: {},
      plugins: []
    };
    
    // 모든 레이어의 datasets를 병합
    layers.forEach((layer, index) => {
      if (layer.data && layer.data.datasets) {
        layer.data.datasets.forEach((dataset, datasetIndex) => {
          mergedData.data.datasets.push({
            ...dataset,
            name: `${dataset.name || layer.statblid || 'Dataset'} (${index + 1})`,
            statblid: layer.statblid
          });
        });
      }
      
      // labels 병합 (첫 번째 레이어의 labels 사용)
      if (index === 0 && layer.labels) {
        mergedData.labels = layer.labels;
      }
      
      // options 병합 (첫 번째 레이어의 options 사용)
      if (index === 0 && layer.options) {
        mergedData.options = layer.options;
      }
    });
    
    return mergedData;
  };

  useEffect(() => {   
    // 페이지 진입 시 히스토리 이미지 리셋
    setChartImageHistory([]);
    console.log('Chart image history reset on page load');
  }, [setChartImageHistory]);

  // 차트 레이어 제거 함수
  const removeChartLayer = (statblid, cardIndex) => {
    setChartLayers(prevLayers => {
      const newLayers = prevLayers.filter(layer => layer.statblid !== statblid);
      console.log('Removed layer for statblid:', statblid);
      console.log('Remaining layers:', newLayers);
      
      // 메인 차트 데이터 재병합
      if (newLayers.length > 0) {
        const mergedChartData = mergeChartLayers(newLayers);
        setChartData(mergedChartData);
      } else {
        setChartData(null);
      }
      
      return newLayers;
    });

    // 카드 상태를 초기화 (X버튼을 숨기기 위해)
    if (cardIndex !== undefined) {
      setCards(prevCards => 
        prevCards.map((card, index) => 
          index === cardIndex 
            ? { 
                ...card, 
                title: ['OPT1', 'OPT2', 'OPT3'][cardIndex], 
                statblid: ['OPT1', 'OPT2', 'OPT3'][cardIndex],
                chartType: 'line',
                ctype: 'dt-index'
              }
            : card
        )
      );
      console.log(`카드 ${cardIndex + 1} 상태 초기화됨`);
    }
  };

  // 카드 드롭 처리 - 제목(cname), 조회타입(ctype) 반영
  const handleDropOnCard = (cardIndex, event) => {
    event.preventDefault();
    let payload = event.dataTransfer.getData('application/json') || event.dataTransfer.getData('text/plain');
    if (!payload) return;
    try {
      const obj = JSON.parse(payload);
      const color = fixedColors[cardIndex];
      const ctype = obj.ctype || 'dt-index';

      setCards(prev => prev.map((c, i) => i === cardIndex ? { ...obj, color, selected: true, ctype } : c));
      if (obj.statblid) fetchChartData(obj.statblid, cardIndex);
    } catch (err) {
      // 드롭 실패 시 무시
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
      date: '20241021',
      title: '(24.10.21) 전세시기 비례 지원',
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

  // 조회년도 범위 변경 시, chartLayers의 각 레이어 원본에서 필터링
  useEffect(() => {
    if (chartLayers && chartLayers.length > 0) {
      const getDateStr = idx => {
        const year = SLIDER_START_YEAR + Math.floor(idx / 12);
        const month = (idx % 12) + 1;
        return `${year}-${String(month).padStart(2, '0')}`;
      };
      const startDate = getDateStr(yearRange[0]);
      const endDate = getDateStr(yearRange[1]);

      // 각 레이어별로 필터링
      const filteredLayers = chartLayers.map(layer => {
        const filteredLabels = layer.data.labels.filter(label => label >= startDate && label <= endDate);
        const filteredDatasets = layer.data.datasets.map(dataset => {
          if (Array.isArray(dataset.data)) {
            return {
              ...dataset,
              data: dataset.data.filter(item => filteredLabels.includes(item.x))
            };
          }
          return dataset;
        });
        return {
          ...layer,
          data: {
            ...layer.data,
            labels: filteredLabels,
            datasets: filteredDatasets
          }
        };
      });

      // 병합해서 chartData로 사용
      const mergedChartData = mergeChartLayers(filteredLayers);
      setChartData(mergedChartData);
    }
    // eslint-disable-next-line
  }, [yearRange, chartLayers]);
  
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
                return `${year}-${String(month).padStart(2,'0')}`;
              }}
              valueLabelFormat={v => {
                const year = SLIDER_START_YEAR + Math.floor(v/12);
                const month = (v%12)+1;
                return `${year}-${String(month).padStart(2,'0')}`;
              }}
            />
            
          </Box>
        </Box>
        <Grid container rowSpacing={1.3} columnSpacing={3} sx={{ p: 2, pt: 0 }}>
          {/* row 1 - 3 미니 카드 */}
          <Grid sx={{ width: '100%', height: 180, display: 'flex', justifyContent: 'center' }}>
            <Grid container spacing={0} sx={{ width: '100%', minHeight: 300, justifyContent: 'center', alignItems: 'flex-start', flexWrap: { xs: 'wrap', sm: 'nowrap' }, gap: 0 }}>
              {[0,1,2].map(idx => (
                <Grid
                  key={idx}
                  sx={{
                    minWidth: 220,
                    maxWidth: 360,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'stretch',
                    justifyContent: 'center',
                    height: 180,
                    minHeight: 180,
                    margin: '0 12px',
                    p: 0
                  }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => handleDropOnCard(idx, e)}
                >
                  {cards[idx] && !cards[idx].selected ? (
                    (() => {
                      return (
                        <Box
                          sx={{
                            flex: 1,
                            minHeight: 180,
                            height: '100%',
                            minWidth: 220,
                            maxWidth: 360,
                            width: '100%',
                            border: '2px dashed #e0e3e8',
                            borderRadius: 1,
                            background: '#f8fbff',
                            boxShadow: '0 2px 8px 0 rgba(33, 150, 243, 0.08)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'stretch',
                            justifyContent: 'flex-start',
                            margin: 0,
                            padding: 0,
                            boxSizing: 'border-box',
                            transition: 'box-shadow 0.2s',
                            overflow: 'hidden'
                          }}
                        >
                          <Box sx={{
                            height: 36,
                            background: '#b0b3b8',
                            borderTopLeftRadius: 1,
                            borderTopRightRadius: 1,
                            borderBottom: '1px solid #b0b3b8',
                            px: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                          }} />
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 36px)' }}>
                            <Typography sx={{ fontSize: 17, color: '#b0b3b8', fontWeight: 500, textAlign: 'center' }}>
                              항목을 선택하세요
                            </Typography>
                          </Box>
                        </Box>
                      );
                    })()
                  ) : (
                    (() => {
                      const statblid = cards[idx]?.statblid;
                      const { option1Options, option2Options } = getCardOptions(statblid);
                      return (
                        <AnalyticsDataCard
                          key={statblid || idx}
                          title={cards[idx]?.cname}
                          statblid={statblid}
                          isActiveInChart={!!statblid}
                          onRemoveFromChart={() => removeChartLayer(statblid, idx)}
                          onResetCard={handleResetCard}
                          option1={cards[idx]?.region}
                          onOption1Change={(newOption1) => handleCardOption1Change(idx, newOption1)}
                          option1Options={option1Options}
                          option2={cards[idx]?.area}
                          onOption2Change={(newOption2) => handleCardOption2Change(idx, newOption2)}
                          option2Options={option2Options}
                          chartData={getCardChartData(statblid, idx)}
                          cardIndex={idx}
                          chartColor={cards[idx]?.color}
                          chartType={cards[idx]?.chartType}
                          ctype={cards[idx]?.ctype}
                          sx={{
                            flex: 1,
                            minHeight: 200,
                            height: '100%',
                            minWidth: 220,
                            maxWidth: 360,
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            margin: 0
                          }}
                        />
                      );
                    })()
                  )}
                </Grid>
              ))}
            </Grid>
          </Grid>
          {/* row 2 */}
          <Grid size={{ xs: 12, md: 10, lg: 12 }} sx={{ mt: 0 }}>
            <Grid container alignItems="center" justifyContent="space-between">
              <Typography variant="h5" sx={{ pl: 0, ml: 0 }}>그래프</Typography>
            </Grid>
            <Box sx={{ position: 'relative' }}>
              {/* fetchChartData 결과 전달 */}
              {chartData ? (
                <ApexMixedChart 
                  key={JSON.stringify(checkedPolicies)}
                  chartData={chartData} 
                  chartColor={(() => {
                    // chartLayers 순서에 맞춰 색상 배열 생성
                    return chartLayers.map(layer => {
                      const card = cards.find(card => card.statblid === layer.statblid);
                      return card ? card.color : '#1976d2';
                    });
                  })()}
                  ctype={cards.reduce((map, card, index) => {
                    if (card.selected && card.statblid) {
                      map[card.statblid] = card.ctype;
                    }
                    return map;
                  }, {})}
                  colorMapping={cards.reduce((map, card, index) => {
                    if (card.selected && card.statblid) {
                      map[card.statblid] = card.color;
                    }
                    return map;
                  }, {})}
                  chartTypeMapping={cards.reduce((map, card, index) => {
                    if (card.selected && card.statblid) {
                      map[card.statblid] = card.chartType;
                    }
                    return map;
                  }, {})}
                  ref={chartRef}
                  policyAnnotations={checkedPolicies}
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
                    // 모든 카드 리셋
                    [0, 1, 2].forEach(cardIndex => {
                      handleResetCard(cardIndex);
                    });
                    // 차트 초기화 기능
                    setChartLayers([]);
                    setChartData(null);
                    //console.log('차트 초기화 및 모든 카드 리셋 완료');
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
                      // 리렌더링 없이 바로 이미지 추출 시도
                      let chartId = chartLayers.length > 0 ? chartLayers[0].statblid : 'chart';
                      let imgURI = await chartRef.current.exportToImage();
                      
                      // 첫 번째 시도가 실패하면 약간의 지연 후 재시도
                      if (!imgURI) {
                        console.log('첫 번째 이미지 추출 실패, 재시도 중...');
                        await new Promise(res => setTimeout(res, 100));
                        imgURI = await chartRef.current.exportToImage();
                      }
                      
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
                          return next;
                        });
                        console.log('차트 이미지 생성 완료:', chartId);
                      } else {
                        alert('이미지 생성에 실패했습니다.');
                      }
                    } else {
                      alert('항목을 드래그하여 그래프를 먼저 생성해 주세요.');
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
