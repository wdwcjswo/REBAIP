import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import SendIcon from '@mui/icons-material/Send';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export default function AiComponent({ open, onToggle, chartImageHistory = [] }) {
  const [aiQuestion, setAiQuestion] = useState("");
  const handleAiQuestion = () => {};
  const handleKeyPress = () => {};
  return (
    <Box
      sx={{
        width: open ? 650 : 400,
        transition: 'width 0.3s',
        height: '100vh',
        position: 'relative',
        bgcolor: 'background.paper',
        borderLeft: 1,
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1200
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', height: 40, pl: 1 }}>
        <IconButton onClick={onToggle} size="small">
          <MenuIcon />
        </IconButton>
      </Box>
      <Box component="h1" sx={{ textAlign: 'center', m: 0, p: 0, lineHeight: 1 }}>
        <img src="/assets/images/REB/rebGpt.svg" alt="REB GPT" style={{ width: '25%', margin: 0, padding: 0, display: 'inline-block', verticalAlign: 'middle' }} />
      </Box>
      {/* AI 컴포넌트 영역 표시 */}
      <Box 
        sx={{ 
          width: '100%', 
          height: '90vh', 
          borderLeft: '1px solid',
          borderColor: 'divider',
          overflow: 'auto',
          backgroundColor: 'background.paper',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 1.5, borderBottom: '1px solid', borderColor: 'divider', flexShrink: 0, backgroundColor: 'primary.lighter' }}>
          <Box className="rebGptWrap" sx={{ mt: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main', textAlign: 'left' }}>
            AI 데이터 분석
          </Typography>
        </Box>
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5, display: 'flex', flexDirection: 'column' }}>
          {/* AI 컴포넌트 영역 */}
            {/* <Box className="gptBox" sx={{ mt: 3 }}>
              <Box className="gptDiv" sx={{ mt: 2, height: 300 }}>
                <iframe
                  id="chat-frame"
                  src="http://172.16.10.57:8080/"
                  width="100%"
                  height="100%"
                  title="chat-frame"
                  style={{ border: 0 }}
                />
              </Box>
            </Box> */}
        </Box>


          {/* TODO: AI 컴포넌트 추가 영역 */}
          <Box sx={{ 
            mt: 3, 
            p: 3, 
            border: '1px dashed', 
            borderColor: 'divider', 
            borderRadius: 2,
            textAlign: 'center',
            flex: 1,
            minHeight: '300px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography variant="body1" color="text.secondary">
              AI 데이터 분석
            </Typography>
          </Box>
          {/* open일 때만 추가 내용 표시: 차트 이미지 히스토리 */}
          {open && chartImageHistory && chartImageHistory.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                차트 이미지 히스토리
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {chartImageHistory.map((img, idx) => (
                  <Box key={idx} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1, bgcolor: 'background.default' }}>
                    <img src={img} alt={`Chart history ${idx + 1}`} style={{ width: '100%', maxHeight: 180, objectFit: 'contain' }} />
                  </Box>
                ))}
              </Box>
            </Box>
          )}
          {/* AI 질문 입력창 */}
          <Box sx={{ 
            mt: 3, 
            display: 'flex', 
            gap: 1.5,
            alignItems: 'flex-end'
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
    </Box>
  );
}
