import * as React from "react";
import {IconButton} from "@mui/material";
import Menu from "@mui/material/Menu";
import Divider from "@mui/material/Divider";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import OpenIcon from "@mui/icons-material/OpenInNew";
import MenuItem from "@mui/material/MenuItem";
import f1mvLogo from "../../assets/f1mv-logo.png";
import packageJson from "../../../package.json";
import Typography from "@mui/material/Typography";

export default function threeDotMenu() {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = () => {
		setAnchorEl(null);
	};
	const handleOpenSettings = () => {
		setAnchorEl(null);
		window.location.hash = "/settings";
	};
	const handleOpenHome = () => {
		setAnchorEl(null);
		window.location.hash = "/home";
	};
	const handleOpenAbout = () => {
		setAnchorEl(null);
		window.location.hash = "/about";
	};
	const handleOpenF1MV = () => {
		setAnchorEl(null);
		window.location.href = "multiviewer://";
	};

	// get the version from package.json
	const currentAppVersion = "v" + packageJson.version;

	const menuItemStyle = {
		fontSize: "1.0rem",
		fontFamily: "Segoe UI",
		width: "100%",
	};

	return (
		<div>
			<IconButton
				aria-label="more"
				id="long-button"
				color="inherit"
				aria-controls={open ? "long-menu" : undefined}
				aria-expanded={open ? "true" : undefined}
				aria-haspopup="true"
				onClick={handleClick}
			>
				<MoreVertIcon />
			</IconButton>
			<Menu
				id="basic-menu"
				anchorEl={anchorEl}
				open={open}
				onClose={handleClose}
				MenuListProps={{
					"aria-labelledby": "basic-button",
				}}
			>
				<MenuItem onClick={handleOpenHome}>
					<HomeIcon
						sx={{
							mr: 2
						}}/>
					<Typography
						variant="body2"
						sx={menuItemStyle}>
                        Home
					</Typography>
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleOpenSettings}>
					<SettingsIcon
						sx={{
							mr: 2
						}}/>
					<Typography
						variant="body2"
						sx={menuItemStyle}>
                        Settings
					</Typography>
				</MenuItem>
				<MenuItem
					onClick={handleOpenAbout}>
					<InfoIcon
						sx={{
							mr: 2
						}}/>
					<Typography
						variant="body2"
						sx={menuItemStyle}>
                        About
					</Typography>
				</MenuItem>
				<Divider />
				<MenuItem onClick={handleOpenF1MV}>
					<img
						src={f1mvLogo}
						alt="MultiViewer for F1 Logo"
						style={{
							width: "1.5rem",
							marginRight: "1rem"
						}}
					/>
					<Typography
						variant="body2"
						sx={menuItemStyle}>
                        Open MultiViewer for F1 <OpenIcon
							sx={{
								ml: 1,
								color: "grey.500",
								fontSize: "0.9rem"
							}} />
					</Typography>
				</MenuItem>
				<Divider />
				<Typography
					variant="body2"
					color="text.secondary"
					sx={{
						color: "grey.500",
						fontSize: "0.9rem",
						fontFamily: "Segoe UI",
						ml: 1,
						width: "100%",
						padding: "0.5rem"
					}}>
                    Current version: {currentAppVersion}
				</Typography>
			</Menu>
		</div>
	);
}