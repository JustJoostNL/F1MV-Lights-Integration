import React from "react";
import {
  Box,
  BoxProps,
  Container,
  Typography,
  TypographyOwnProps,
} from "@mui/material";
import { Loader } from "../shared/Loader";
import { Navbar } from "./Navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  hideNavbar?: boolean;
  hideTitle?: boolean;
  titleVariant?: TypographyOwnProps["variant"];
  container?: boolean;
  isLoading?: boolean;
  containerProps?: BoxProps;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({
  title,
  children,
  hideTitle = false,
  titleVariant = "h3",
  hideNavbar = false,
  container = false,
  isLoading = false,
  containerProps,
  ...props
}) => {
  const ContainerWrapper = container ? Container : React.Fragment;

  return (
    <Box minHeight="100vh" display="flex" flexDirection="column" {...props}>
      {!hideNavbar && <Navbar />}
      <Box flexGrow={1}>
        {/* @ts-ignore */}
        <ContainerWrapper {...containerProps}>
          {isLoading && <Loader />}
          {!hideTitle && title && !isLoading && (
            <Typography
              fontWeight={800}
              variant={titleVariant}
              noWrap
              my={2}
              textAlign="center"
            >
              {title}
            </Typography>
          )}
          {!isLoading && children}
        </ContainerWrapper>
      </Box>
    </Box>
  );
};
