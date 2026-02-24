import { Paper, Table, TableHead, TableRow, TableCell, TableBody, Button } from "@mui/material";

export default function TablaSolicitudes({ solicitudes, gestionarSolicitud }) {
  return (
    <Paper>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Propiedad</TableCell>
            <TableCell>Solicitante</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell align="right">Acciones</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {solicitudes.map((s) => (
            <TableRow key={s.id}>
              <TableCell>{s.propiedad_id}</TableCell>
              <TableCell>{s.arrendatario_id}</TableCell>
              <TableCell>
                {new Date(s.fecha).toLocaleDateString()}
              </TableCell>
              <TableCell>{s.estado}</TableCell>
              <TableCell align="right">
                {s.estado === "pendiente" && (
                  <>
                    <Button
                      size="small"
                      onClick={() =>
                        gestionarSolicitud(s.id, "aprobar")
                      }
                    >
                      Aprobar
                    </Button>

                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        gestionarSolicitud(s.id, "rechazar")
                      }
                    >
                      Rechazar
                    </Button>
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}