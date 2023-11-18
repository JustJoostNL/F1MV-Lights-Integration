import React from "react";
import { Box, BoxProps, Container, Typography } from "@mui/material";
import { Navbar } from "./Navbar";

interface ContentLayoutProps {
  title: string;
  children: React.ReactNode;
  hideNavbar?: boolean;
  hideTitle?: boolean;
  container?: boolean;
  containerProps?: BoxProps;
}

export const ContentLayout: React.FC<ContentLayoutProps> = ({
  title,
  children,
  hideTitle = false,
  hideNavbar = false,
  container = false,
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
          {!hideTitle && title && (
            <Typography fontWeight={800} variant="h3" noWrap my={2}>
              {title}
            </Typography>
          )}
          {children}
        </ContainerWrapper>
      </Box>
    </Box>
  );
};
