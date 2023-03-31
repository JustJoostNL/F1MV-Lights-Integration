import React, { useEffect, useState } from "react";
import {Typography, Accordion, AccordionSummary, AccordionDetails, Button} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {allSettings} from "./allSettings";
import {useHotkeys} from "react-hotkeys-hook";
import JsonTree from "@/components/json-tree";

const SettingsPage: React.FC = () => {
	const [paperWidth, setPaperWidth] = useState<number>(400);
	const [showDebugTree, setShowDebugTree] = useState<boolean>(false);
	const [config, setConfig] = useState<any | null>(null);

	const integrationSettings = allSettings.filter((setting) => setting.type === "integration");
	const nonIntegrationSettings = allSettings.filter((setting) => setting.type !== "integration" && setting.type !== "advanced");
	const advancedSettings = allSettings.filter((setting) => setting.type === "advanced");

	useEffect(() => {
		async function fetchConfig() {
			setInterval(async () => {
				const config = await window.f1mvli.config.getAll();
				setConfig(config);
			}, 1000);
		}
		fetchConfig();
	}, []);

	useHotkeys("d", () => {
		setShowDebugTree(!showDebugTree);
	});

	useHotkeys("shift+o", () => {
		window.f1mvli.config.openInEditor()
	});

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
			{nonIntegrationSettings.map(({ heading, content }) => (
				<div key={heading} style={{ marginBottom: "20px" }}>
					<Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
						<AccordionSummary expandIcon={<ExpandMoreIcon />}>
							<Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "20px" }}>
								{heading}
							</Typography>
						</AccordionSummary>
						<AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
							{content}
						</AccordionDetails>
					</Accordion>
				</div>
			))}
			<div style={{ marginBottom: "20px" }}>
				<Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
					<AccordionSummary expandIcon={<ExpandMoreIcon />}>
						<Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "20px" }}>
								Integration Settings
						</Typography>
					</AccordionSummary>
					<AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
						{integrationSettings.map(({ heading, content }) => (
							<div key={heading} style={{ marginBottom: "20px" }}>
								<Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px", mr: "45px" }}>
									<AccordionSummary expandIcon={<ExpandMoreIcon />}>
										<Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "20px" }}>
											{heading}
										</Typography>
									</AccordionSummary>
									<AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
										{content}
									</AccordionDetails>
								</Accordion>
							</div>
						))}
					</AccordionDetails>
				</Accordion>
			</div>
			<div style={{ marginBottom: "20px" }}>
				{advancedSettings.map(({ heading, content }) => (
					<div key={heading} style={{ marginBottom: "20px" }}>
						<Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
							<AccordionSummary expandIcon={<ExpandMoreIcon />}>
								<Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "20px" }}>
									{heading}
								</Typography>
							</AccordionSummary>
							<AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
								{content}
							</AccordionDetails>
						</Accordion>
					</div>
				))}
			</div>
			{showDebugTree && (
				<JsonTree data={config} />
			)}
		</div>
	);
};


export default SettingsPage;
