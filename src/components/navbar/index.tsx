import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import threeDotMenu from './menu';

export default function NavBar() {
    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            flexGrow: 1,
                            textAlign: 'left',
                            fontSize: '2rem'
                        }}
                    >
                        F1MV Lights Integration
                    </Typography>
                    {threeDotMenu()}
                </Toolbar>
            </AppBar>
        </Box>
    );
}


