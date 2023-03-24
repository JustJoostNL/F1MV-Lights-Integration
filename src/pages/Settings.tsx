import * as React from 'react';
import NavBar from "@/components/navbar";
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Settings() {
    return (
        <div>
            <NavBar showSettingsBackButton={true} />
            <h1>Settings</h1>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>General Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel2a-content"
                    id="panel2a-header"
                >
                    <Typography>F1MV Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                        malesuada lacus ex, sit amet blandit leo lobortis eget.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel3a-content"
                    id="panel3a-header"
                >
                    <Typography>Philips Hue Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel4a-content"
                    id="panel4a-header"
                >
                    <Typography>Ikea Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel5a-content"
                    id="panel5a-header"
                >
                    <Typography>Govee Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel6a-content"
                    id="panel6a-header"
                >
                    <Typography>OpenRGB Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel7a-content"
                    id="panel7a-header"
                >
                    <Typography>Home Assistant Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel8a-content"
                    id="panel8a-header"
                >
                    <Typography>Nanoleaf Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel9a-content"
                    id="panel9a-header"
                >
                    <Typography>WLED Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel10a-content"
                    id="panel10a-header"
                >
                    <Typography>YeeLight Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel11a-content"
                    id="panel11a-header"
                >
                    <Typography>Elgato Stream Deck Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel12a-content"
                    id="panel12a-header"
                >
                    <Typography>Discord Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel13a-content"
                    id="panel13a-header"
                >
                    <Typography>Webserver Settings</Typography>
                </AccordionSummary>
            </Accordion>
            <Accordion disabled>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel14a-content"
                    id="panel14a-header"
                >
                    <Typography>Advanced Settings</Typography>
                </AccordionSummary>
            </Accordion>
        </div>
    )
}