'use client';

import { useEffect, useRef, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import InputAdornment from '@mui/material/InputAdornment';

// assets
import SearchOutlined from '@ant-design/icons/SearchOutlined';

// ==============================|| NAVER MAP ||============================== //

export default function Map() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentMarkerRef = useRef(null);
  
  const [address, setAddress] = useState('');

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

    // Naver Maps Client ID (환경변수에서 로드)
    const CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
    
    if (!CLIENT_ID) {
      console.error('NEXT_PUBLIC_NAVER_CLIENT_ID 환경변수가 설정되지 않았습니다.');
      if (mapRef.current) {
        mapRef.current.innerHTML = '<div style="padding: 20px; text-align: center; color: red;">Client ID가 설정되지 않았습니다. 환경변수를 확인하세요.</div>';
      }
      return;
    }
    
    // Naver Map API 스크립트 동적 로드 (Geocoder 서비스 포함)
    const script = document.createElement('script');
    script.id = 'naver-map-script';
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${CLIENT_ID}&submodules=geocoder`;
    script.async = true;
        
    script.onload = () => {
      //console.log('Naver Maps API 스크립트 로드 성공');
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
    };
  }, []);

  const initMap = () => { 
    if (window.naver && window.naver.maps && mapRef.current) {
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5665, 126.9780), // 서울 시청 좌표
        zoom: 10
      };
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      //console.log('지도 생성 완료 - 중심:', mapOptions.center.toString());

      // 서울시청 위치에 기본 마커 표시
      const initialMarker = new window.naver.maps.Marker({
        position: mapOptions.center,
        map: map,
        title: '서울시청'
      });
      currentMarkerRef.current = initialMarker;
      
    } else {
      console.error('지도 초기화 실패 - naver 객체 또는 mapRef가 없음');
    }
  };

  // 주소로 좌표 검색 함수 (Geocoding API 사용)
  const searchAddressToCoordinate = (searchAddress) => {
    if (!mapInstanceRef.current) {
      console.error('지도가 초기화되지 않았습니다.');
      return;
    }

    // Geocoding API 사용
    window.naver.maps.Service.geocode({
      query: searchAddress
    }, (status, response) => {
      if (status !== window.naver.maps.Service.Status.OK) {
        console.error('주소 검색 실패:', searchAddress, status);
        alert('주소를 찾을 수 없습니다. 정확한 주소를 입력해주세요.');
        return;
      }

      if (response.v2.meta.totalCount === 0) {
        alert('검색 결과가 없습니다.');
        return;
      }

      const item = response.v2.addresses[0];
      const point = new window.naver.maps.LatLng(item.y, item.x);
      
      console.log('주소 검색 성공:', searchAddress);
      console.log('좌표:', item.y, item.x);
      console.log('생성된 LatLng:', point);
      
      // 지도 중심 이동
      mapInstanceRef.current.setCenter(point);
      mapInstanceRef.current.setZoom(16);
      
      console.log('지도 중심 이동 완료');

      // 기존 마커 제거
      if (currentMarkerRef.current) {
        console.log('기존 마커 제거');
        currentMarkerRef.current.setMap(null);
      }

      // 새 마커 추가
      try {
        const marker = new window.naver.maps.Marker({
          position: point,
          map: mapInstanceRef.current,
          title: item.roadAddress || item.jibunAddress
        });
        currentMarkerRef.current = marker;
      } catch (error) {
        console.error('마커 생성 실패:', error);
      }
    });
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    if (address.trim()) {
      searchAddressToCoordinate(address);
    }
  };

  // Enter 키 핸들러
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', height: 'calc(100vh - 140px)' }}>
      {/* 주소 검색 입력창 */}
      <Paper
        elevation={3}
        sx={{
          position: 'absolute',
          top: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1000,
          p: 2,
          display: 'flex',
          gap: 1,
          minWidth: 400,
          maxWidth: 600
        }}
      >
        <TextField
          fullWidth
          placeholder="주소를 입력하세요(예: 중구 세종대로 110)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onKeyPress={handleKeyPress}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            ),
            sx: { fontSize: '0.75rem' }
          }}
        />
        <Button variant="contained" onClick={handleSearch} sx={{ minWidth: 80 }}>
          검색
        </Button>
      </Paper>

      {/* 지도 */}
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative'
        }}
      />
    </Box>
  );
}
