import React, { useEffect, useState } from "react";
import { Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { settingsData } from "./settingsData";

const SettingsPage: React.FC = () => {
	const [paperWidth, setPaperWidth] = useState<number>(400);

	useEffect(() => {
		const handleResize = () => {
			setPaperWidth(window.innerWidth * 0.8);
		};
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	return (
		<div>
			<Typography variant="h2" sx={{ textAlign: "center", mb: "80px", mt: "80px" }}>
                Settings
			</Typography>
			{settingsData.map(({ heading, content }) => (
				<div key={heading} style={{ marginBottom: "20px" }}>
					<Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "20px" }}>
								{heading}
							</Typography>
						</AccordionSummary>
						<AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
							<Typography variant="body1" sx={{ color: "grey", textAlign: "left", mb: "20px" }}>
								{content}
							</Typography>
						</AccordionDetails>
					</Accordion>
				</div>
			))}
		</div>
	);
};


export default SettingsPage;
