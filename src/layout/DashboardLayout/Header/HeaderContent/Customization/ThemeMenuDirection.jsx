import CardMedia from '@mui/material/CardMedia';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'components/MainCard';
import useConfig from 'hooks/useConfig';

// assets
const defaultLayout = '/assets/images/customization/default.svg';

const layouts = [
  { value: 'ltr', label: 'LTR', img: defaultLayout }
];

// ==============================|| CUSTOMIZATION - MENU DIRECTION ||============================== //

export default function ThemeMenuDirection() {
  const { themeDirection, onChangeDirection } = useConfig();

  const activeCardStyle = (theme) => ({
    bgcolor: 'primary.lighter',
    boxShadow: theme.customShadows.primary,
    '&:hover': { boxShadow: theme.customShadows.primary }
  });

  const renderLayoutCard = ({ value: layoutValue, label, img }) => (
    <Grid key={layoutValue}>
      <FormControlLabel
        value={layoutValue}
        control={<Radio sx={{ display: 'none' }} />}
        label={
          <MainCard
            content={false}
            border={false}
            boxShadow
            sx={(theme) => ({
              bgcolor: 'secondary.lighter',
              p: 1,
              ...(themeDirection === layoutValue && { ...activeCardStyle(theme) })
            })}
          >
            <Stack sx={{ gap: 1.25, alignItems: 'center' }}>
              <CardMedia component="img" src={img} alt={label} sx={{ borderRadius: 1, width: 60, height: 60 }} />
              <Typography variant="caption">{label}</Typography>
            </Stack>
          </MainCard>
        }
      />
    </Grid>
  );

  return (
    <RadioGroup
      row
      aria-label="theme-layout"
      name="theme-layout"
      value={themeDirection}
      onChange={(e) => onChangeDirection(e.target.value)}
      sx={{ px: 1.5 }}
    >
      <Grid container spacing={2}>
        {layouts.map((layout) => renderLayoutCard(layout))}
      </Grid>
    </RadioGroup>
  );
}
