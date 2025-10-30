import React, { useState, useContext } from 'react';
import { ChartImageHistoryContext } from './index';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function AiComponent({ width = 400 }) {
  const [aiQuestion, setAiQuestion] = useState("");
  const handleAiQuestion = () => {};
  const handleKeyPress = () => {};

  // Context에서 chartImageHistory 가져오기
  const { chartImageHistory } = useContext(ChartImageHistoryContext);

  // React.useEffect(() => {
  //   console.log('[AiComponent] chartImageHistory:', chartImageHistory);
  // }, [chartImageHistory]);

  return (
    <Box
      sx={{
        width,
        minWidth: width,
        maxWidth: width,
        transition: 'width 0.2s',
        //height: '100%',
        position: 'relative',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        mt: '64px'
      }}
      >
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: 40, pl: 1 }}>
        <IconButton onClick={onToggle} size="small">
          <MenuIcon />
        </IconButton>
      </Box> */}
      <Box component="h1" sx={{ textAlign: 'center', m: 0, p: 0, lineHeight: 1, backgroundColor: 'primary.lighter', paddingTop: '26px' }}>
        <img src="/assets/images/REB/rebGpt.svg" alt="REB GPT" style={{ width: '25%', margin: 0, padding: 0, display: 'inline-block', verticalAlign: 'middle' }} />
      </Box>
      {/* AI 컴포넌트 영역 표시 */}
      <Box 
        sx={{ 
          width: '100%', 
          flex: 1,
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            AI 데이터 분석
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', p: 2 , backgroundColor: 'primary.lighter' }}>
          {/* <iframe id="chat-frame" src="http://172.16.10.57:8080/" width="100%" height="300" frameBorder="0" title="chat-frame"></iframe> */}
        </Box>
        {/* 차트 이미지 히스토리 및 다운로드 링크  */}
        { chartImageHistory && chartImageHistory.length > 0 && (
          <Box sx={{ px: 2, py: 2, borderTop: '1px solid', borderColor: 'divider', backgroundColor: 'background.paper' }}>
            <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
              차트 이미지 히스토리
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, overflowX: 'auto' }}>
              {chartImageHistory.map((img, idx) => {
                const src = img.uri || img;
                const ext = img.ext || (src.startsWith('data:image/png') ? 'png' : 'svg');
                const fileName = `chart_${img.uuid || 'chart'}_${idx + 1}.${ext}`;
                return (
                  <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'background.default', minWidth: 180, maxWidth: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <a href={src} download={fileName} style={{ width: '100%', display: 'block' }} title="이미지 다운로드">
                      <img src={src} alt={`Chart history ${idx + 1}`} style={{ width: '100%', maxHeight: 180, objectFit: 'contain', cursor: 'pointer' }} />
                    </a>
                  </Box>
                );
              })}
            </Box>
          </Box>
        )}
        {/* AI 질문 입력창 - 하단 고정 */}
        <Box sx={{ 
          px: 2, py: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider', 
          backgroundColor: 'background.paper',
          display: 'flex', 
          gap: 1.5,
          alignItems: 'flex-end',
          position: 'sticky',
          bottom: 0,
          zIndex: 2
        }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            variant="outlined"
            placeholder="AI에게 질문하세요..."
            value={aiQuestion}
            onChange={(e) => setAiQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            size="medium"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                fontSize: '14px'
              }
            }}
          />
          <IconButton 
            color="primary" 
            onClick={handleAiQuestion}
            disabled={!aiQuestion.trim()}
            sx={{ 
              bgcolor: 'primary.main',
              color: 'white',
              width: 48,
              height: 48,
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&.Mui-disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled'
              }
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
}
