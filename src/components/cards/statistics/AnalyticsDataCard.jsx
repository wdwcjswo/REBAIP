import PropTypes from 'prop-types';
// material-ui
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

// project imports
import MainCard from 'components/MainCard';

// assets
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';

const iconSX = { fontSize: '0.75rem', color: 'inherit', marginLeft: 0, marginRight: 0 };

// ==============================|| STATISTICS - ECOMMERCE CARD ||============================== //

export default function AnalyticsDataCard({ 
  color = 'primary', 
  title, 
  count, 
  statblid, 
  isActiveInChart = false,
  onRemoveFromChart
}) {
  return (
    <MainCard 
      content={false}
      sx={{ 
        position: 'relative',
        border: isActiveInChart ? '2px solid #1976d2' : '1px solid #e0e0e0',
        backgroundColor: isActiveInChart ? '#f3f7ff' : 'inherit'
      }}
    >
      {isActiveInChart && onRemoveFromChart && (
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <Tooltip title="차트에서 제거">
            <IconButton 
              size="small" 
              onClick={onRemoveFromChart}
              sx={{ 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                '&:hover': { backgroundColor: '#f5f5f5' }
              }}
            >
              <CloseOutlined style={{ fontSize: '14px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      )}
      
      <Box sx={{ p: 2.25 }}>
        <Stack sx={{ gap: 0.5 }}>
          <Typography variant="h6" color="text.secondary">
            {title}
            {isActiveInChart && (
              <Chip 
                label="차트에 표시됨" 
                size="small" 
                color="primary" 
                sx={{ ml: 1, fontSize: '10px', height: '20px' }}
              />
            )}
          </Typography>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography variant="h4" color="inherit">
              {count} 
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              {statblid}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </MainCard>
  );
}

AnalyticsDataCard.propTypes = {
  color: PropTypes.string,
  title: PropTypes.string,
  count: PropTypes.string,
  statblid: PropTypes.string,
  isActiveInChart: PropTypes.bool,
  onRemoveFromChart: PropTypes.func
};
