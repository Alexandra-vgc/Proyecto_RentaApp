import jsPDF from "jspdf";

/**
 * Genera un PDF profesional basado en el tipo de contrato (Arriendo o Venta)
 * @param {Object} contrato - Datos del cliente y la propiedad
 * @param {string} tipo - 'inquilino' o 'comprador'
 */
export const generarPDFContrato = (contrato, tipo) => {
  const doc = new jsPDF();
    doc.setLineHeightFactor(1.5);
  const fechaHoy = new Date().toLocaleDateString('es-EC', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  const esVenta = tipo === 'comprador';

  // --- CONFIGURACIÓN DE PÁGINA ---
  const margin = 25; // más margen
const anchoTexto = doc.internal.pageSize.width - (margin * 2) - 10;
  let y = 25;

  // --- ENCABEZADO FORMAL ---
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("REPÚBLICA DEL ECUADOR", doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 6;
  doc.text("NOTARÍA DIGITAL - SISTEMA MIRentaApp", doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 15;

  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  const titulo = esVenta ? "CONTRATO DE PROMESA DE COMPRAVENTA" : "CONTRATO DE ARRENDAMIENTO DE INMUEBLE";
  doc.text(titulo, doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 5;
  doc.setDrawColor(198, 106, 61); // Color Dorado/Naranja
  doc.setLineWidth(1);
  doc.line(margin + 20, y, doc.internal.pageSize.width - margin - 20, y);
  y += 15;

  // --- CUERPO LEGAL CORREGIDO (Uso de splitTextToSize) ---
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // Texto de Introducción
  const intro = `En la ciudad de San Francisco de Quito, Distrito Metropolitano, a los ${fechaHoy}, comparecen libre y voluntariamente a la suscripción del presente instrumento jurídico: Por una parte, el Administrador del Sistema MiRentaApp, a quien para efectos del presente se denominará EL ${esVenta ? 'VENDEDOR' : 'ARRENDADOR'}; y, por otra parte, el Sr./Sra. ${contrato.nombre_cliente.toUpperCase()}, de nacionalidad ${contrato.nacionalidad || 'ECUATORIANA'}, de estado civil ${contrato.estado_civil || 'SOLTERO/A'}, portador de la cédula de identidad N° ${contrato.cedula || '17XXXXXXX-X'}, a quien en adelante se lo denominará como EL ${esVenta ? 'COMPRADOR' : 'ARRENDATARIO'}. Las partes, de manera libre y espontánea, acuerdan las siguientes cláusulas:`;

  // ✅ SOLUCIÓN: Ajustar texto de introducción
  const introLines = doc.splitTextToSize(intro, anchoTexto);
  doc.text(introLines, margin, y, { maxWidth: anchoTexto });
  // Calculamos la nueva 'y' basada en el número de líneas generadas
  const lineHeight = 7;
y += (introLines.length * lineHeight) + 10;

  // Definición de cláusulas (igual que antes)
  let clausulas = [];
  if (esVenta) {
    clausulas = [
      { t: "PRIMERA: ANTECEDENTES Y OBJETO.-", c: `EL VENDEDOR es propietario legítimo del inmueble ubicado en el sector ${contrato.nombre_propiedad}. Por medio del presente, EL VENDEDOR promete transferir el dominio y la posesión definitiva a favor del COMPRADOR.` },
      { t: "SEGUNDA: PRECIO Y FORMA DE PAGO.-", c: `El precio pactado de común acuerdo por la compraventa es la suma de $${contrato.precio_total || (contrato.canon * 100)} USD. EL COMPRADOR declara que los fondos utilizados tienen un origen lícito y no contravienen las leyes de control de lavado de activos.` },
      { t: "TERCERA: PLAZO Y ESCRITURACIÓN.-", c: "Las partes acuerdan un plazo de noventa días para la protocolización de la escritura pública definitiva ante el Notario del Cantón Quito, asumiendo el comprador los gastos de registro." },
      { t: "CUARTA: ENTREGA DEL INMUEBLE.-", c: `La entrega física y real de las llaves y la posesión del bien se realizará en la fecha ${contrato.fecha_inicio}, debiendo el inmueble estar libre de gravámenes, hipotecas o prohibiciones de enajenar.` },
      { t: "QUINTA: JURISDICCIÓN.-", c: "En caso de controversia, las partes renuncian a fuero y domicilio y se someten a los jueces competentes de la Unidad Judicial Civil de Pichincha." }
    ];
  } else {
    clausulas = [
      { t: "PRIMERA: OBJETO DEL ARRENDAMIENTO.-", c: `EL ARRENDADOR entrega en arrendamiento al ARRENDATARIO el inmueble de su propiedad ubicado en ${contrato.nombre_propiedad}, el cual se encuentra en óptimas condiciones de habitabilidad.` },
      { t: "SEGUNDA: CANON DE ARRENDAMIENTO.-", c: `La pensión mensual de arrendamiento se fija en $${contrato.canon} USD mensuales, los cuales deberán ser cancelados mediante transferencia bancaria dentro de los primeros cinco días de cada mes.` },
      { t: "TERCERA: PLAZO DE VIGENCIA.-", c: `El tiempo de duración del presente contrato es de DOS AÑOS (24 meses) forzosos, de conformidad con la Ley de Inquilinato, iniciando su vigencia el día ${contrato.fecha_inicio}.` },
      { t: "QUINTA: GARANTÍA DE FIEL CUMPLIMIENTO.-", c: `EL ARRENDATARIO entrega la suma de $${contrato.canon * 2} USD en concepto de garantía para cubrir posibles daños en la infraestructura o planillas de servicios básicos pendientes (luz, agua, internet).` },
      { t: "SEXTA: PROHIBICIÓN DE SUBARRIENDO.-", c: "Queda estrictamente prohibido para el arrendatario subarrendar total o parcialmente el inmueble objeto de este contrato, así como darle un uso distinto al de vivienda familiar." }
    ];
  }

  // ✅ SOLUCIÓN: Renderizado de cláusulas con ajuste de texto
  clausulas.forEach(item => {
    // Verificamos si nos estamos quedando sin espacio en la página
    if (y > 250) {
      doc.addPage();
      y = margin;
    }

    doc.setFont("times", "bold");
    doc.text(item.t, margin, y);
    y += 6;
    
    doc.setFont("times", "normal");
    // Ajustamos el contenido de la cláusula
    const lines = doc.splitTextToSize(item.c, anchoTexto);
    doc.text(lines, margin, y, { maxWidth: anchoTexto });
    y += (lines.length * lineHeight) + 8;
  });

  // --- SECCIÓN DE FIRMAS (Sin cambios, pero ajustada en 'y') ---
  // --- SECCIÓN DE FIRMAS (AJUSTE DE NOMBRES) ---
  y = 245;
  if (y > doc.internal.pageSize.height - 50) { 
      doc.addPage();
      y = 40;
  }
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  
  // Coordenadas para centrar nombres bajo las líneas
  const centroFirmaIzq = margin + 40;
  const centroFirmaDer = doc.internal.pageSize.width - margin - 40;

  // 1. Dibujar Líneas
  doc.line(margin + 5, y, margin + 75, y); 
  doc.line(doc.internal.pageSize.width - margin - 75, y, doc.internal.pageSize.width - margin - 5, y);

  // 2. Etiquetas de Cargo (F. EL PROPIETARIO / F. EL COMPRADOR)
  y += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("F. EL PROPIETARIO", centroFirmaIzq, y, { align: "center" });
  doc.text(`F. EL ${esVenta ? 'COMPRADOR' : 'ARRENDATARIO'}`, centroFirmaDer, y, { align: "center" });
  
  // 3. NOMBRES ESPECÍFICOS (MiRentaApp / NOMBRE DEL CLIENTE)
  y += 6;
  doc.setFont("times", "normal");
  doc.setFontSize(11);
  doc.text("SISTEMA MiRentaApp", centroFirmaIzq, y, { align: "center" });
  doc.text(contrato.nombre_cliente.toUpperCase(), centroFirmaDer, y, { align: "center" });

  // Pie de página de seguridad
  doc.setFontSize(7);
  doc.setTextColor(150);
  doc.text(`Documento generado electrónicamente - Validación Digital`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });

  // Descarga
  doc.save(`Contrato_${tipo}_${contrato.nombre_cliente.replace(/\s+/g, '_')}.pdf`);
};

const ModuloContratos = () => null;
export default ModuloContratos;