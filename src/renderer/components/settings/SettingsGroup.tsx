import React, { Fragment, useState, useCallback } from "react";
import {
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  ButtonBase,
  Card,
  CardHeader,
  IconButton,
  Tooltip,
  styled,
  Typography,
  Collapse,
  CardContent,
  Stack,
} from "@mui/material";
import {
  Edit,
  KeyboardArrowDownRounded,
  KeyboardArrowUpRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/system";
import { isEqual } from "lodash";
import { useConfig } from "../../hooks/useConfig";
import { defaultConfig } from "../../../shared/config/defaultConfig";
import { IConfig } from "../../../shared/config/config_types";

interface Setting {
  type: "setting";
  title: string;
  description: string;
  configKeys: (keyof IConfig)[];
  input?: React.ReactNode;
  condition?: boolean;
}

interface Subgroup {
  type: "subgroup";
  title: string;
  settings: (Setting | Subgroup | Custom)[];
}

interface Custom {
  type: "custom";
  children: React.ReactNode;
}

export interface SettingsGroupProps {
  defaultOpen?: boolean;
  title: string;
  description?: string;
  settings: (Setting | Subgroup | Custom)[];
  experimental?: boolean;
}

export const ListItemTextStyled = styled(ListItemText)(({ theme }) => ({
  marginRight: theme.spacing(2),
}));

const DivStyled = styled("div")(() => ({
  flexShrink: 0,
  maxWidth: "40%",
}));

const ButtonBaseStyled = styled(ButtonBase)(({ theme }) => ({
  width: "100%",
  justifyContent: "space-between",
  textAlign: "left",
  paddingRight: theme.spacing(2),
  transition: theme.transitions.create("background-color"),
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  },
}));

function renderSettings(
  settings: (Setting | Subgroup | Custom)[],
  config: IConfig,
) {
  return settings.map((setting, index) => {
    if (setting.type === "setting") {
      const isEdited = setting.configKeys.some(
        (key) => !isEqual(config[key], defaultConfig[key]),
      );

      return setting.condition === false ? null : (
        <ListItem key={index}>
          <ListItemTextStyled
            primary={
              <Stack direction="row" alignItems="center" gap={1}>
                {setting.title}
                {isEdited && (
                  <Tooltip title="Edited" arrow>
                    <Edit color="info" fontSize="inherit" />
                  </Tooltip>
                )}
              </Stack>
            }
            secondary={setting.description}
          />
          {setting.input ? <DivStyled>{setting.input}</DivStyled> : null}
        </ListItem>
      );
    }

    if (setting.type === "subgroup") {
      return (
        <Fragment key={index}>
          <ListSubheader>{setting.title}</ListSubheader>
          {renderSettings(setting.settings, config)}
        </Fragment>
      );
    }

    if (setting.type === "custom") {
      return <Fragment key={index}>{setting.children}</Fragment>;
    }

    return null;
  });
}

export const SettingsGroup: React.FC<SettingsGroupProps> = ({
  defaultOpen = false,
  title,
  description,
  settings,
  experimental = false,
}) => {
  const { config } = useConfig();
  const [isOpen, setOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  return (
    <Card
      variant={experimental ? "outlined" : undefined}
      sx={experimental ? { borderColor: "warning.main" } : undefined}
    >
      <ButtonBaseStyled onClick={handleToggle}>
        <CardHeader
          title={title}
          titleTypographyProps={
            experimental ? { color: "warning.main" } : undefined
          }
          subheader={description}
        />
        <IconButton component="a" disableRipple>
          {isOpen ? <KeyboardArrowUpRounded /> : <KeyboardArrowDownRounded />}
        </IconButton>
      </ButtonBaseStyled>
      <Collapse in={isOpen}>
        {experimental && (
          <CardContent sx={{ py: 0 }}>
            <Typography variant="body2" color="text.secondary">
              These settings are not guaranteed to work. Use at your own risk.
            </Typography>
          </CardContent>
        )}
        <List>{renderSettings(settings, config)}</List>
      </Collapse>
    </Card>
  );
};
