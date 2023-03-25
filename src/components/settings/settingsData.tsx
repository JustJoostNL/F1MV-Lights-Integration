import React from "react";
import {alpha, styled, Switch} from "@mui/material";
import Typography from "@mui/material/Typography";
import {lightBlue} from "@mui/material/colors";

function GeneralSettingsContent() {
    return (
        <div>
                <div>
                    <Typography
                        variant="h6"
                        component="div"
                        sx={{
                            color: 'white',
                        }}
                    >
                        Enable F1MV
                    </Typography>
                    <Typography
                        variant="body2"
                        component="div"
                        sx={{
                            color: 'grey',
                        }}
                    >
                        Enable F1MV to control your lights
                    </Typography>
                </div>
        </div>
    );
}

const ipsum: string = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas laoreet, diam vel facilisis vehicula, massa metus facilisis nibh, sit amet commodo erat leo vel lacus."

export const settingsData = [
    {
        heading: 'General Settings',
        content: GeneralSettingsContent()
    },
    {
        heading: 'F1MV Settings',
        content: ipsum
    },
    {
        heading: 'Philips Hue Settings',
        content: ipsum
    },
    {
        heading: 'Ikea Settings',
        content: ipsum
    },
    {
        heading: 'Govee Settings',
        content: ipsum
    },
    {
        heading: 'OpenRGB Settings',
        content: ipsum
    },
    {
        heading: 'Home Assistant Settings',
        content: ipsum
    },
    {
        heading: 'Nanoleaf Settings',
        content: ipsum
    },
    {
        heading: 'WLED Settings',
        content: ipsum
    },
    {
        heading: 'YeeLight Settings',
        content: ipsum
    },
    {
        heading: 'Elgato Stream Deck Settings',
        content:  ipsum
    },
    {
        heading: 'Discord Settings',
        content: ipsum
    },
    {
        heading: 'Webserver Settings',
        content: ipsum
    },
    {
        heading: 'Advanced Settings',
        disabled: true
    },
];