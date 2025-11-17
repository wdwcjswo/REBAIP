'use client';

import { useEffect, useRef } from 'react';

// material-ui
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| NAVER MAP ||============================== //

export default function Map() {
  const mapRef = useRef(null);

  useEffect(() => {
    // 인증 실패 처리 함수 등록
    window.navermap_authFailure = function () {
      console.error('Naver Map API 인증 실패: Client ID를 확인하세요.');
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">지도 API 인증에 실패했습니다. Client ID를 확인하세요.</div>';
      }
    };

    // 스크립트가 이미 로드되어 있는지 확인
    if (document.getElementById('naver-map-script')) {
      initMap();
      return;
    }

    // Naver Map API 스크립트 동적 로드
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=stss67kbrv';
    script.async = true;
    script.onload = () => {
      initMap();
    };
    script.onerror = () => {
      console.error('Naver Map API 스크립트 로드 실패');
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">지도 스크립트 로드에 실패했습니다.</div>';
      }
    };
    document.head.appendChild(script);

    return () => {
      // cleanup 시 인증 실패 함수 제거
      if (window.navermap_authFailure) {
        delete window.navermap_authFailure;
      }
      // cleanup 시 스크립트 제거 (선택사항)
      // const existingScript = document.getElementById('naver-map-script');
      // if (existingScript) {
      //   document.head.removeChild(existingScript);
      // }
    };
  }, []);

  const initMap = () => {
    if (window.naver && window.naver.maps && mapRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
        zoom: 10
      };
      new window.naver.maps.Map(mapRef.current, mapOptions);
    }
  };

  return (
    <MainCard title="네이버 지도">
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '600px',
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
    </MainCard>
  );
}
