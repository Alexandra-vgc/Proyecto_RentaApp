import { Drawer, List, ListItemButton, ListItemText, Toolbar } from "@mui/material";
import { Add, Home, Mail, Description } from "@mui/icons-material";

const drawerWidth = 260;

export default function SidebarAdmin({ seccion, setSeccion, resetForm }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        "& .MuiDrawer-paper": { width: drawerWidth },
      }}
    >
      <Toolbar />
      <List>
        <ListItemButton
          selected={seccion === "publicar"}
          onClick={() => {
            resetForm();
            setSeccion("publicar");
          }}
        >
          <Add sx={{ mr: 1 }} />
          <ListItemText primary="Publicar" />
        </ListItemButton>

        <ListItemButton
          selected={seccion === "mis-departamentos"}
          onClick={() => setSeccion("mis-departamentos")}
        >
          <Home sx={{ mr: 1 }} />
          <ListItemText primary="Mis Propiedades" />
        </ListItemButton>

        <ListItemButton
          selected={seccion === "solicitudes"}
          onClick={() => setSeccion("solicitudes")}
        >
          <Mail sx={{ mr: 1 }} />
          <ListItemText primary="Solicitudes" />
        </ListItemButton>

        <ListItemButton
          selected={seccion === "contrato"}
          onClick={() => setSeccion("contrato")}
        >
          <Description sx={{ mr: 1 }} />
          <ListItemText primary="Contratos" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}