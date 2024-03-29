import * as React from "react";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ListSubheader from "@mui/material/ListSubheader";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import AssignmentIcon from "@mui/icons-material/Assignment";
import {useNavigate} from "react-router-dom";

export const MainListItems = () => {
    const navigate = useNavigate();
    return ( <React.Fragment>
            {/*Change button color using current route*/}
    <ListItemButton sx={{
        backgroundColor: (theme) => window.location.pathname === "/" ? theme.palette.primary.light : "transparent",
    }} onClick={() => {
        navigate("/");
    }}>
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="View Products" />
    </ListItemButton>
    <ListItemButton sx={{
        backgroundColor: (theme) => window.location.pathname === "/add-product" ? theme.palette.primary.light : "transparent",
    }} onClick={() => {
        navigate("/add-product");
    }}>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Add Product" />
    </ListItemButton>
    {/*<ListItemButton>*/}
    {/*  <ListItemIcon>*/}
    {/*    <ShoppingCartIcon />*/}
    {/*  </ListItemIcon>*/}
    {/*  <ListItemText primary="Orders" />*/}
    {/*</ListItemButton>*/}
    {/*<ListItemButton>*/}
    {/*  <ListItemIcon>*/}
    {/*    <PeopleIcon />*/}
    {/*  </ListItemIcon>*/}
    {/*  <ListItemText primary="Customers" />*/}
    {/*</ListItemButton>*/}
    {/*<ListItemButton>*/}
    {/*  <ListItemIcon>*/}
    {/*    <BarChartIcon />*/}
    {/*  </ListItemIcon>*/}
    {/*  <ListItemText primary="Reports" />*/}
    {/*</ListItemButton>*/}
  </React.Fragment>
);
}

export const secondaryListItems = (
  <React.Fragment>
    <ListSubheader component="div" inset>
      Saved reports
    </ListSubheader>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Current month" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Last quarter" />
    </ListItemButton>
    <ListItemButton>
      <ListItemIcon>
        <AssignmentIcon />
      </ListItemIcon>
      <ListItemText primary="Year-end sale" />
    </ListItemButton>
  </React.Fragment>
);
