import { createMuiTheme } from '@material-ui/core/styles';

export default createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: {
        main: '#cfded5',
        contrastText: '#454a47',
      },
      secondary: {
        main: '#545b57',
        contrastText: '#ffffff',
      },
      error: {
        main: '#B71C1C',
        contrastText: '#ffffff',
      },
    },
});

export const errorTheme = createMuiTheme({
    typography: {
      useNextVariants: true,
    },
    palette: {
      primary: {
        main: '#B71C1C',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#009688',
        contrastText: '#ffffff',
      },
    },
});

