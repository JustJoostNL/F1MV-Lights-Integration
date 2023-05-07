import React, { useEffect, useState } from "react";
import { Typography, Accordion, AccordionSummary, AccordionDetails, Button } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandLess";
import { allSettings } from "./allSettings";
import { useHotkeys } from "react-hotkeys-hook";
import JsonTree from "@/components/json-tree";
import { ipcRenderer } from "electron";

const SettingsPage: React.FC = () => {
  const [paperWidth, setPaperWidth] = useState<number>(400);
  const [showDebugTree, setShowDebugTree] = useState<boolean>(false);
  const [config, setConfig] = useState<any | null>(null);

  const integrationSettings = allSettings.filter((setting) => setting.type === "integration");
  const nonIntegrationSettings = allSettings.filter((setting) => setting.type !== "integration" && setting.type !== "advanced");
  const advancedSettings = allSettings.filter((setting) => setting.type === "advanced");

  useEffect(() => {
    async function fetchConfig() {
      const config = await window.f1mvli.config.getAll();
      setConfig(config);
    }
    fetchConfig();
    ipcRenderer.on("config:didAnyChange", fetchConfig);
    return () => {
      ipcRenderer.removeListener("config:didAnyChange", fetchConfig);
    };
  }, []);

  useHotkeys("d", () => {
    setShowDebugTree(!showDebugTree);
  });

  useHotkeys("shift+o", () => {
    window.f1mvli.config.openInEditor();
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
      {nonIntegrationSettings.map(({ heading, content, description }) => (
        <div key={heading} style={{ marginBottom: "20px" }}>
          <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "5px" }}>
                  {heading}
                </Typography>
                <Typography variant="h6" component="h6" sx={{ fontSize: "1rem", ml: "5px", color: "grey.400" }}>
                  {description}
                </Typography>
              </div>
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
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "5px" }}>
								Integration Settings
              </Typography>
              <Typography variant="h6" component="h6" sx={{ fontSize: "1rem", ml: "5px", color: "grey.400" }}>
              Philips Hue — IKEA — Govee — OpenRGB — Home Assistant — Nanoleaf — WLED — YeeLight — Stream Deck — Discord — Webserver
              </Typography>
            </div>
          </AccordionSummary>
          <AccordionDetails sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", padding: "20px" }}>
            {integrationSettings.map(({ heading, content, description }) => (
              <div key={heading} style={{ marginBottom: "20px" }}>
                <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px", mr: "45px" }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "5px" }}>
                        {heading}
                      </Typography>
                      <Typography variant="h6" component="h6" sx={{ fontSize: "1rem", ml: "5px", color: "grey.400" }}>
                        {/*{description}*/}
                      </Typography>
                    </div>
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
        {advancedSettings.map(({ heading, content, description }) => (
          <div key={heading} style={{ marginBottom: "20px" }}>
            <Accordion sx={{ boxShadow: "none", backgroundColor: "transparent", borderRadius: "10px" }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "white", textAlign: "left", ml: "5px", mr: 2 }}>
                    {heading}
                  </Typography>
                  <Typography variant="h6" component="h6" sx={{ fontSize: "1rem", ml: "5px", color: "grey.400" }}>
                    {description}
                  </Typography>
                </div>
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
