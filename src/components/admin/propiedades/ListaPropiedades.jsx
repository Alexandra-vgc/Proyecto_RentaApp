import { Grid, Card, CardContent, CardMedia, Typography, Button, Box, Chip } from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

export default function ListaPropiedades({ propiedades, prepararEdicion, eliminarPropiedad }) {
  return (
    <Grid container spacing={3}>
      {propiedades.map((p) => (
        <Grid item xs={12} md={4} key={p.id}>
          <Card>
            <CardMedia
              component="img"
              height="200"
              image={p.imagen_url || "https://via.placeholder.com/400x250"}
            />
            <CardContent>
              <Typography variant="h6">{p.sector}</Typography>
              <Typography color="text.secondary">{p.ciudad}</Typography>

              <Chip label={`$${p.precio}/mes`} sx={{ mt: 1 }} />

              <Box mt={2} display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<Edit />}
                  onClick={() => prepararEdicion(p)}
                >
                  Editar
                </Button>

                <Button
                  size="small"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => eliminarPropiedad(p.id)}
                >
                  Eliminar
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}