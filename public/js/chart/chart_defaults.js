
//Chart.defaults.font.family ='NotoSansKR';
//Chart.defaults.font.family = 'Noto_bold';
Chart.defaults.font.family = 'NanumSquareRound_regular';

Chart.defaults.elements.point.borderWidth = 2;
Chart.defaults.elements.point.radius = 1;
Chart.defaults.elements.point.backgroundColor = '#2d2f38';
Chart.defaults.elements.point.hoverBorderWidth = 2;
Chart.defaults.elements.point.hoverRadius = 3;
Chart.defaults.elements.point.hoverBackgroundColor = '#2d2f38';




Chart.defaults.elements.line.borderWidth = 1;
Chart.defaults.elements.line.tension = 0;
Chart.defaults.elements.line.fill = false;

Chart.defaults.font.size = 11;


Chart.defaults.hover.mode = 'index';
Chart.defaults.hover.intersect = false;




/*
	차트 스타일(폰트, 색상 등)을 설정.
*/
_m_chartStyle = { dark  : { 
						 grid     : { color            : '#444655', //그리드 선색
	 								  x_year_color     : '#ff236078' //년도 그리드 색
									},
						 ticks    : { color           : '#d5d5d5', //텍스트 색
									  x_year_color    : '#fff', //년도 텍스트색
	 				 				  backdropColor   : '#f00',
	 								  textStrokeColor : '#f00',
									  textStrokeWidth : 2	
									},
						 tooltip : 	{ backgroundColor : 'rgba(0,0,0,0.8)',
	  				 				  titleFontColor  : "#fff",
	  				 				  borderColor     : "rgba(123,123,123,0.6)", 
					 				  borderWidth     : 2,
									},
						 issue   : {  backgroundColor : 'rgba(0, 150, 0, 0.2)', //이슈 바 색
									  borderColor     : 'rgba(255, 255, 255, 0.2)', //이슈 바 테두리 색
							          label           : {
											backgroundShadowColor : 'rgb(255, 255, 0)', //이슈 라벨 박스 색
											borderColor : 'rgba(255, 255, 0, 0.3)', //이슈 라벨 박스 테두리
											color : '#fff' //이슈 라벨 텍스트
										  }
								  }
					}   
					,  light  : { 
							 grid     :  { color            : '#dedede',
	 								   	   x_year_color     : '#71adeb'
       									 },
							 ticks    :  { color           : '#676767',
										   x_year_color    : '#063375',
		 				 				   backdropColor   : '#f00',
		 								   textStrokeColor : '#063375',
										   textStrokeWidth : 1
	  									},
							 tooltip : 	{ backgroundColor : 'rgba(0,0,0,0.8)',
		  				 				  titleFontColor  :  "#fff",
		  				 				  borderColor     :  "rgba(123,123,123,0.6)", 
	    				 				  borderWidth     : 2,
										},
							 issue   : {  backgroundColor : '#ffd55366',
										  borderColor     : 'rgba(0, 150, 0, 0.1)',
								          label           : {
											  backgroundShadowColor : 'rgba(0,0,0,0.3)',
											  borderColor : 'rgba(0,0,0, 0.2)',
											  color : '#212121'														  
										}
									  }
						} 
}