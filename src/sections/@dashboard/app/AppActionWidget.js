import { Link } from 'react-router-dom';

// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography, Button } from '@mui/material';
// utils
import { fShortenNumber } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/Iconify';


// ----------------------------------------------------------------------

const IconWrapperStyle = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(10),
  height: theme.spacing(10),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

AppActionWidget.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  path: PropTypes.string,
  btnColor: PropTypes.string,
  btnSize: PropTypes.number,
  btnText: PropTypes.string,
  sx: PropTypes.object,
};

export default function AppActionWidget({ icon, path, btnColor="primary", btnSize="large", btnText, color="primary", sx, ...other }) {
  return (
    <Card
      sx={{
        py: 5,
        boxShadow: 0,
        textAlign: 'center',
        color: (theme) => theme.palette[color].darker,
        bgcolor: (theme) => theme.palette[color].lighter,
        ...sx,
      }}
      {...other}
    >
      <IconWrapperStyle
        sx={{
          color: (theme) => theme.palette[color].dark,
          backgroundImage: (theme) =>
            `linear-gradient(135deg, ${alpha(theme.palette[color].dark, 0)} 0%, ${alpha(
              theme.palette[color].dark,
              0.35
            )} 100%)`,
        }}
      >
        <Iconify icon={icon} width={30} height={30} />
      </IconWrapperStyle>

      <Button sx={{
            mt: 2
          }}
        component={Link}
        variant="contained" size={btnSize} color={btnColor} to={path}>
        {btnText}
      </Button>
      
    </Card>
  );
}
