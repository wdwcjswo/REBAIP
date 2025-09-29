// 공통 스크립트
$(function(){

    
    function customChartOption(modalCharts){
        var charts = !modalCharts ? document.querySelectorAll('canvas') : modalCharts;
        charts.forEach((chart) => {
            // 커스텀되는 range, legend 불러오기
            if(chart.setting && chart.setting.config.custom){
                if(chart.setting.config.custom.range) createRange(chart);
                if(chart.setting.config.custom.rangeType2) createRangeType2(chart);
                if(chart.setting.config.custom.legend) createLegend(chart);
                if(chart.setting.config.custom.ticks) customTicks(chart);
                if(chart.setting.config.custom.tooltip) customTooltip(chart);
            }

            // 차트 더블클릭 이벤트
            if(!modalCharts){ // 모달차트 클릭방지
                chart.addEventListener('dblclick', createChartModal);
            }
            return;
        })
    }
    customChartOption();

    /*************** range custom *********************************/
    // 커스텀 range input 객체 생성하기 (년 ~ 주)
    function createRange(chart){
        var createRange = `<div class="range ${chart.id}_range">
            <span class="text">1년</span>
            <div class="range_cus">
                <div class="range_track">
                    <p class="fill" style="width:0%"></p>
                    <i class="thumb" style="left:100%"></i>
                </div>
                <input type="range" class="range_inp" min="1" max="100" value="100"/>
            </div>
            <span class="text">12주</span>
        </div>`;

        $(chart).closest('.chart').after(createRange);
    }
    
    // 커스텀 range input 객체 생성하기 (type2 년 ~ 개월)
    function createRangeType2(chart){
        var createRange = `<div class="range ${chart.id}_range">
            <span class="text">1년</span>
            <div class="range_cus">
                <div class="range_track">
                    <p class="fill" style="width:0%"></p>
                    <i class="thumb" style="left:100%"></i>
                </div>
                <input type="range" class="range_inp_type2" min="1" max="100" value="100"/>
            </div>
            <span class="text">6개월</span>
        </div>`;

        $(chart).closest('.chart').after(createRange);
    }
    
    // 커스텀 range input 스타일 연결, 12주 ~ 1년 조절 이벤트
    function changeRange(e){
        // html 객체와 스타일 연결
        var {max, value} = e.target;
        value = 101 - value
        var track = $(e.target).siblings('.range_track');
        track.children('.fill').css('width', value + '%');
        track.children('.thumb').css('left', 100-value + '%');
        // 기간 조절
        var charts = $(e.target).closest('.chart_cont').find('canvas');
        for(var i=0; i<charts.length; i++){
            var chart = charts[i];    
            var val = value*1;
            var labels = chart.setting.config.data.labels
            val = Math.floor(val / (max / (labels.length - 12))) + 12;
            for(var j=0; j<chart.setting.options.scales.xAxes.length; j++){
                chart.setting.options.scales.xAxes[j].ticks.min = labels[labels.length - val];
            }
            chart.setting.update(); 
        }
    }
    
    // 커스텀 range input 스타일 연결, 6개월 ~ 1년 조절 이벤트
    function changeRangeType2(e){
        // html 객체와 스타일 연결
        var {max, value} = e.target;
        value = 101 - value
        var track = $(e.target).siblings('.range_track');
        track.children('.fill').css('width', value + '%');
        track.children('.thumb').css('left', 100-value + '%');
        // 기간 조절
        var charts = $(e.target).closest('.chart_cont').find('canvas');
        for(var i=0; i<charts.length; i++){
            var chart = charts[i];    
            var val = value*1;
            var length = chart.setting.config.data.datasets[0].data.length;
            val =  Math.floor(val / (max / (length - length/2))) + length/2 

            var labels = chart.setting.config.data.datasets[0].data.map((el) => {return el.x})
            for(var j=0; j<chart.setting.options.scales.xAxes.length; j++){
                chart.setting.options.scales.xAxes[j].ticks.min = labels[labels.length - val];
            }
            chart.setting.update(); 
        }
    }

    // range input 이 로드되면 이벤트 불러오기
    function loadRange(){
        var range = document.querySelectorAll('.range_inp');
        range.forEach((el) => {
            el.addEventListener('input', changeRange);
        })
        var rangeType2 = document.querySelectorAll('.range_inp_type2');
        rangeType2.forEach((el) => {
            el.addEventListener('input', changeRangeType2);
        })
    }
    loadRange();

    /*************** legend custom *********************************/
    // 커스텀 legend 객체 생성하기
    function createLegend(chart){
        var createLegend = `<div class="legend ${chart.id}_legend"></div>`
        $(chart).closest('.chart').after(createLegend);

        chart.setting.config.options.legendCallback = function(chart){
            var createLegend = "";
            createLegend += '<ul class="legend_cus">';
            for (i = 0; i < chart.data.datasets.length; i++) {
                var dataset = chart.data.datasets[i];
                if (!(dataset.hideLegend) && dataset.label) {
                    createLegend += `<li datasetIndex="${i}" onClick="legendClick(event, ${i}, this)">
                        <span class="icon icon${i}" data-label="${dataset.label}"></span>
                        <span class="text">${dataset.label}</span>
                   </li>`;
                }
            }
            
            createLegend += '</ul>';
            return createLegend;
        }
        
        var legend = document.querySelector(`.${chart.id}_legend`);
        legend.innerHTML = chart.setting.generateLegend();
    }

    // 커스텀 legend 클릭 이벤트
    legendClick = function (e, datasetIndex, target) {
        var canvas = $(target).closest(".chart_cont").find("canvas");
        for(var i=0; i<canvas.length; i++){
            var _t = canvas[i].id
            var index = datasetIndex;
            var ci = eval("e.view." + _t + ".setting");
            var meta = ci.getDatasetMeta(index);
            meta.hidden = !meta.hidden;
            
            // 레전드 disabled
            if (meta.hidden) {
                $(target).addClass('disabled');
            } else {
                $(target).removeClass('disabled');
            }
            
            ci.update();
        };
    };

    /*************** ticks custom *********************************/
    // 커스텀 ticks (시계열 그래프)
    function customTicks(chart){
        chart.setting.config.options.scales.xAxes = [
            {   
                // 움직이기 위한 라벨
                display: true, 
                gridLines:{
                    drawTicks:false,
                },
                ticks: {
                    display:false,
                    min: weeks[weeks.length - 12],
                    max: weeks[weeks.length - 1],
                }
            }, {
                // 실제 노출되는 라벨 (주차)
                display: true, 
                gridLines: {
                    display: (chart.id === 'chart0_4' || chart.id === 'modal_chart0_4') 
                    ? false 
                    : true, 
                    drawTicks:false,
                },
                ticks: {
                    min: weeks[weeks.length - 12],
                    max: weeks[weeks.length - 1],
                    minRotation:0,
                    maxRotation:0,
                    callback: function(value){
                        return value.split('/')[2]+'주';
                    },
                }
            }, {
                // 실제 노출되는 라벨 (월)
                display: true, 
                gridLines: {
                    display: false, 
                    drawTicks:false,
                },
                ticks: {
                    fontColor: "#899dff",
                    padding:-6,
                    maxRotation: 0,
                    autoSkip: false,
                    min: weeks[weeks.length - 12],
                    max: weeks[weeks.length - 1],
                    callback: function(value){
                        var val = value.split('/');
                        val[0] = val[0]+'년'
                        val[1] = val[1]+'월'
                        val[2] = val[2]+'주'
                        return val[2] === '1주' 
                        ? (val[1] === '1월' 
                            ? val[0] + val[1]
                            : val[1]) 
                        : '';
                    },
                }
            }
        ];
        chart.setting.update();
    }

    /*************** tooltip custom *********************************/
    // 커스텀 tooltip
    function customTooltip(chart){
        chart.setting.config.options.tooltips.enabled = false;
        chart.setting.config.options.tooltips.custom = function(tooltip){
            // tooltip 객체 만들기
            var tooltipEl = document.getElementsByClassName(chart.id+'_tooltip')[0];
            var weighted = document.getElementsByClassName(chart.id+'_weighted')[0];

            var positionY = this._chart.canvas.offsetTop;
            var positionX = this._chart.canvas.offsetLeft;

            if (!tooltipEl) {
                tooltipEl = document.createElement('div');
                tooltipEl.classList.add('tooltip');
                tooltipEl.classList.add(chart.id+'_tooltip');
                chart.parentNode.appendChild(tooltipEl);
            }

            // Hide if no tooltip
            if (tooltip.opacity === 0) {
                tooltipEl.style.opacity = 0;
                
                // chart0_1 가중치 툴팁
                if(weighted){
                    weighted.style.opacity = 0;
                }
                return;
            }

            // tooltip 안의 객체 구성하기
            if (tooltip.body) {
                var innerHtml = '';

                // chart0_1 툴팁
                if(chart.id === 'chart0_1' || chart.id ==='modal_chart0_1'){
                    innerHtml += '<div><ul>';
                    tooltip.body.forEach((el, i) => {
                        var name = i == 0 ? 'MP' : tooltip.title[0];
                        var price = el.lines[0];
                        price = numberCustom(price)
                        
                        innerHtml += `<li>
                        <strong class="tooltip_label">${name}</strong>
                        <span class="fw_100">${price}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                    
                    // 가중치 툴팁
                    if (!weighted) {
                        weighted = document.createElement('div');
                        weighted.classList.add(chart.id+'_weighted');
                        chart.parentNode.appendChild(weighted);
                    }
                    weighted.innerHTML = chart.setting.config.data.datasets[1].weightedData[tooltip.dataPoints[1].index] + '%';
                    weighted.style.opacity = 1;
                    weighted.style.left = positionX + tooltip.caretX + 'px';
                    weighted.style.top = chart.setting.chartArea.bottom + positionY - 43 + 'px';
                }

                // chart0_2, chart1_1 툴팁
                else if(chart.id === 'chart0_2' || chart.id ==='modal_chart0_2' || chart.id === 'chart1_1' || chart.id ==='modal_chart1_1'){
                    var date = tooltip.title[0].split('/');
                    innerHtml += `<div>
                        <p>${date[1]}월 ${date[2]}주차</p>
                        <ul class="martop_4">`;
                    tooltip.body.forEach((el) => {
                        var item = el.lines[0].split(':');
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <i class="icon" data-label="${item[0]}"></i>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                // chart0_4 툴팁
                else if(chart.id === 'chart0_4' || chart.id ==='modal_chart0_4'){
                    var date = tooltip.title[0].split('/');
                    var color = ['#ff4fb6', '#6a7bfd', '#5de298']
                    innerHtml += `<div>
                        <p>${date[1]}월 ${date[2]}주차</p>
                        <ul class="martop_4">`;
                    tooltip.body.forEach((el, i) => {
                        var item = el.lines[0].split(':');
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <span class="dot" style="background-color:${color[i]}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                // chart2_1, chart2_2 툴팁
                else if(chart.id === 'chart2_1' || chart.id ==='modal_chart2_1' || chart.id === 'chart2_2' || chart.id ==='modal_chart2_2'){
                    var date = tooltip.title[0];
                    innerHtml += `<div>
                        <p>${date}</p>
                        <ul class="martop_4">`;
                    tooltip.body.forEach((el, i) => {
                        var item = el.lines[0].split(':');
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <span class="dot" style="background-color:${tooltip.labelColors[i].borderColor}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                // chart2_3 툴팁
                else if(chart.id === 'chart2_3' || chart.id ==='modal_chart2_3'){
                    var date = tooltip.title[0].split('/');
                    innerHtml += `<div>
                        <p>${date[1]}월${date[2]}일</p>
                        <ul class="martop_4">`;
                    tooltip.body.forEach((el, i) => {
                        var item = el.lines[0].split(':');
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <span class="dot" style="background-color:${tooltip.labelColors[i].borderColor}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                // chart4_1, chart4_2 툴팁
                else if(chart.id === 'chart4_1' || chart.id ==='modal_chart4_1' || chart.id === 'chart4_2' || chart.id ==='modal_chart4_2'){
                    var date = tooltip.title[0].split('-');
                    // 월 에서 '0' 빼기
                    date[1] = date[1].slice(0,1) == '0' ?
                    date[1].slice(1,2) :
                    date[1];
                    // 일 에서 '0' 빼기
                    date[2] = date[2].slice(0,1) == '0' ?
                    date[2].slice(1,2) :
                    date[2];
                    innerHtml += `<div>
                    <p>${date[1]}월${date[2]}일</p>
                    <ul class="martop_4">`;
                    tooltip.body.forEach((el, i) => {
                        var color = i == 0 ? '#ff4fb6' : tooltip.labelColors[i].borderColor;
                        var item = el.lines[0].split(':');
                        item[0] = i == 0 ? 'MP' : item[0];
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <span class="dot" style="background-color:${color}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                // chart4_3 툴팁
                else if(chart.id === 'chart4_3' || chart.id ==='modal_chart4_3'){
                    var date = tooltip.title[0].split('-');
                    // 월 에서 '0' 빼기
                    date[1] = date[1].slice(0,1) == '0' ?
                    date[1].slice(1,2) :
                    date[1];
                    // 일 에서 '0' 빼기
                    date[2] = date[2].slice(0,1) == '0' ?
                    date[2].slice(1,2) :
                    date[2];
                    if(tooltip.dataPoints[0].datasetIndex <= 2){ // master price(상/하), 시가수준 툴팁
                        
                        var week = new Date(tooltip.title[0]);
                        week = Math.ceil(week.getDate() / 7);
                        innerHtml += `<div>
                        <p>${date[1]}월${week}주</p>
                        <ul class="martop_4">`;
                        tooltip.body.forEach((el, i) => {
                            var item = el.lines[0].split(':');
                            item[1] = numberCustom(item[1]);
                            innerHtml += `<li>
                            <span class="dot" style="background-color:${tooltip.labelColors[i].borderColor}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                            </li>`
                        });
                        
                    }else{ // 나머지 툴팁
                        
                        innerHtml += `<div>
                        <p>${date[1]}월${date[2]}일</p>
                        <ul class="martop_4">`;
                        tooltip.body.forEach((el, i) => {
                            var item = el.lines[0].split(':');
                            item[1] = numberCustom(item[1]);
                            innerHtml += `<li>
                            <span class="dot" style="background-color:${tooltip.labelColors[i].backgroundColor}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                            </li>`
                        });

                    }
                    innerHtml += '</ul></div>';
                }
                
                else{ // 공통 툴팁
                    var date = tooltip.title[0].split('/');
                    innerHtml += `<div>
                        <p>${date[1]}월 ${date[2]}주차</p>
                        <ul class="martop_4">`;
                    tooltip.body.forEach((el, i) => {
                        var item = el.lines[0].split(':');
                        item[1] = numberCustom(item[1]);
                        innerHtml += `<li>
                            <span class="dot" style="background-color:${tooltip.labelColors[i].borderColor}"></span>
                            <strong class="tooltip_label">${item[0]}</strong>
                            <span class="fw_100">${item[1]}</span>
                        </li>`
                    });
                    innerHtml += '</ul></div>';
                }

                tooltipEl.innerHTML = innerHtml;
            }

            // Display, position, and set styles for font
            tooltipEl.style.opacity = 1;
            tooltipEl.style.left = positionX + tooltip.caretX + 'px';
            tooltipEl.style.top = positionY + tooltip.caretY + 'px';
            // 툴팁이 왼쪽으로 많이 벗어났을때
            if(tooltip.caretX < 150){
                tooltipEl.classList.add('left')
            }else{
                tooltipEl.classList.remove('left')
            }
        }
    }


    // 그래프 설명 툴팁 (question chart_info) 
    /* 211005 수정 */
    $(document).on('mouseover', '.question_btn', function(){

        var parent = $(this).closest('.sub_title');
        var titleW = parent.children('h2').width() + parent.children('.question').width();
        $(this).siblings('.chart_info').css('width', parent.width() - titleW - 20).addClass('active');

    }).on('mouseleave', '.question_btn', function(){

        $(this).siblings('.chart_info').removeClass('active');
    })


    /*************** modal custom *********************************/
    // 차트 더블클릭시 모달 이벤트
    function createChartModal(e){
        var originChart = $(e.target).closest('.chart_area') 
        var cloneChart = originChart.clone();
        
        $('#chart_modal_wrap').children().remove('.chart_area');
        $('#chart_modal_wrap').append(cloneChart);
        // 클론된 차트옵션 객체 지우기
        $('#chart_modal_wrap .chart_area').find('.range').remove(); 
        $('#chart_modal_wrap .chart_area').find('.legend').remove(); 
        $('#chart_modal_wrap .chart_area').find('.tooltip').remove(); 
        $('#chart_modal_wrap .chart_area').find('.chart0_1_weighted').remove(); 

        var originChartConfig = originChart.find('canvas').map((i, el) => {
            return el.setting.config;
        })
        var modalChart = cloneChart[0].querySelectorAll('canvas');
        for(var i=0; i<modalChart.length; i++) {
            modalChart[i].id = 'modal_'+modalChart[i].id
            
            // 차트 defaults 셋팅하기
            Chart.defaults.global.defaultFontSize = 16;
            
            var ctx = modalChart[i].getContext('2d');
            modalChart[i].setting = new Chart(ctx, originChartConfig[i]);
            modalChart[i].setting.options.elements.line.borderWidth = 2;
            modalChart[i].setting.options.elements.point.borderWidth = 3;
            modalChart[i].setting.options.elements.point.hoverBorderWidth = 3;
            modalChart[i].setting.options.elements.point.hoverRadius = 5;
            // chart0_3_1, chart0_3_2 일때 Y 축 폰트크기
            if(modalChart[i].id === 'modal_chart0_3_1' || modalChart[i].id === 'modal_chart0_3_2'){
                originChartConfig[i].options.scales.yAxes[0].ticks.fontSize = 12;
            }
            
            if(modalChart[i].id === 'modal_chart4_3'){
                // chart4_3 master price 레전드 동시에 2가지 클릭
                $(document).ready(function(){
                    $(document).on('click', '.modal_chart4_3_legend li:eq(0)', function(){ 
                        $(this).next()[0].click();
                    });
                    $('.modal_chart4_3_legend li:eq(0) .text').html('Master Price(상/하)');
                    $('.modal_chart4_3_legend li:eq(1)').css('display', 'none');
                })
                
                // chart4_3 y축 폰트크기
                originChartConfig[i].options.scales.yAxes[0].ticks.fontSize = 12;
                // chart4_3 x축 폰트크기
                originChartConfig[i].options.scales.xAxes[0].ticks.fontSize = 12;
                originChartConfig[i].options.scales.xAxes[1].ticks.fontSize = 12;
                originChartConfig[i].options.scales.xAxes[2].ticks.fontSize = 12;
            }
            
        }
        // 차트옵션 다시 로드하기
        customChartOption(modalChart);
        loadRange();
                
        // dimLayer 만들기
        $('#chart_modal_wrap').addClass('active');
        $('body').append('<div id="dimLayer"></div>');
    }

    // 모달 닫기
    $(document).on('click', '.close_modal_btn, #dimLayer', function(){
        $('#chart_modal_wrap').removeClass('active');
        $('#dimLayer').remove();

        // 모달에서 설정한 default 값 다시 되돌리기
        Chart.defaults.global.defaultFontSize = 12;
    });

});

// 가격에 , 찍는 함수
var numberCustom = function(value){
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
