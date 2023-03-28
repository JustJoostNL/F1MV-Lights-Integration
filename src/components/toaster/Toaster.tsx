import React from "react";
import {Alert, Snackbar} from "@mui/material";

export default function Toaster(props:{
    message: string,
    severity: "success" | "info" | "warning" | "error"
    time: number
}) {
	const [open, setOpen] = React.useState(true);

	const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
		if (reason === "clickaway") {
			return;
		}

		setOpen(false);
	};


	return (
		<Snackbar open={open}
			autoHideDuration={props.time}
			// @ts-ignore
			onClose={handleClose}>
			<Alert onClose={handleClose} severity={props.severity} sx={{width: "100%"}}>
				{props.message}
			</Alert>
		</Snackbar>
	);
}