import jsPDF from "jspdf";

/**
 * Genera un PDF profesional basado en el tipo de contrato (Arriendo o Venta)
 * @param {Object} contrato - Datos del cliente y la propiedad
 * @param {string} tipo - 'inquilino' o 'comprador'
 */
export const generarPDFContrato = (contrato, tipo) => {
  const doc = new jsPDF();
  
  // Constantes de estilo
  const margin = 25; 
  const anchoTexto = doc.internal.pageSize.width - (margin * 2);
  const lineHeight = 6; // Espacio entre líneas de un mismo párrafo
  const paragraphSpacing = 10; // Espacio extra después de un párrafo
  let y = margin; // Posición vertical inicial

  const fechaHoy = new Date().toLocaleDateString('es-EC', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });
  const esVenta = tipo === 'comprador';

  // --- FUNCIÓN AUXILIAR PARA IMPRIMIR TEXTO MULTILÍNEA Y CONTROLAR EL SALTO DE PÁGINA ---
  const printTextLines = (text, isBold = false) => {
    doc.setFont("times", isBold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, anchoTexto);
    
    lines.forEach(line => {
      // Si llegamos al final de la página (dejando espacio para las firmas)
      if (y > doc.internal.pageSize.height - 30) {
        doc.addPage();
        y = margin; // Reiniciamos Y en la nueva página
      }
      doc.text(line, margin, y);
      y += lineHeight;
    });
    // Añadimos el espacio extra al terminar el párrafo
    y += paragraphSpacing; 
  };


  // --- ENCABEZADO FORMAL ---
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("REPÚBLICA DEL ECUADOR", doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 8;
  doc.text("NOTARÍA DIGITAL - SISTEMA MiRentaApp", doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 15;

  doc.setFontSize(14);
  const titulo = esVenta ? "CONTRATO DE PROMESA DE COMPRAVENTA" : "CONTRATO DE ARRENDAMIENTO DE INMUEBLE";
  doc.text(titulo, doc.internal.pageSize.width / 2, y, { align: "center" });
  y += 6;
  
  // Línea dorada separadora
  doc.setDrawColor(198, 106, 61); // Color Dorado/Naranja
  doc.setLineWidth(1);
  doc.line(margin, y, doc.internal.pageSize.width - margin, y);
  y += 15;

  // --- CUERPO LEGAL ---
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);

  // Texto de Introducción
  const intro = `En la ciudad de San Francisco de Quito, Distrito Metropolitano, a los ${fechaHoy}, comparecen libre y voluntariamente a la suscripción del presente instrumento jurídico: Por una parte, el Administrador del Sistema MiRentaApp, a quien para efectos del presente se denominará EL ${esVenta ? 'VENDEDOR' : 'ARRENDADOR'}; y, por otra parte, el Sr./Sra. ${contrato.nombre_cliente.toUpperCase()}, de nacionalidad ${contrato.nacionalidad || 'ECUATORIANA'}, de estado civil ${contrato.estado_civil || 'SOLTERO/A'}, portador de la cédula de identidad N° ${contrato.cedula || '17XXXXXXX-X'}, a quien en adelante se lo denominará como EL ${esVenta ? 'COMPRADOR' : 'ARRENDATARIO'}. Las partes, de manera libre y espontánea, acuerdan las siguientes cláusulas:`;

  // Imprimimos la intro usando la función auxiliar
  printTextLines(intro);

  // Definición de cláusulas
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

  // Imprimimos cada cláusula
  clausulas.forEach(item => {
    printTextLines(item.t + " " + item.c);
  });

  // --- SECCIÓN DE FIRMAS ---
  // Si estamos muy abajo en la página, forzamos un salto para que las firmas no queden cortadas
  if (y > doc.internal.pageSize.height - 60) { 
      doc.addPage();
      y = margin + 20;
  } else {
      y += 30; // Damos un buen espacio antes de las firmas
  }
  
  doc.setDrawColor(0);
  doc.setLineWidth(0.5);
  
  // Coordenadas para centrar nombres bajo las líneas
  const anchoMitad = doc.internal.pageSize.width / 2;
  const centroFirmaIzq = margin + (anchoMitad - margin) / 2;
  const centroFirmaDer = anchoMitad + (anchoMitad - margin) / 2;

  // 1. Dibujar Líneas
  doc.line(margin, y, anchoMitad - 10, y); // Línea Izquierda
  doc.line(anchoMitad + 10, y, doc.internal.pageSize.width - margin, y); // Línea Derecha

  // 2. Etiquetas de Cargo 
  y += 5;
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("F. EL PROPIETARIO", centroFirmaIzq, y, { align: "center" });
  doc.text(`F. EL ${esVenta ? 'COMPRADOR' : 'ARRENDATARIO'}`, centroFirmaDer, y, { align: "center" });
  
  // 3. NOMBRES ESPECÍFICOS
  y += 6;
  doc.setFont("times", "normal");
  doc.text("SISTEMA MiRentaApp", centroFirmaIzq, y, { align: "center" });
  doc.text(contrato.nombre_cliente.toUpperCase(), centroFirmaDer, y, { align: "center" });

  // Pie de página de seguridad (siempre al final de la hoja)
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Documento generado electrónicamente - Validación Digital`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: "center" });

  // Descarga
  doc.save(`Contrato_${tipo}_${contrato.nombre_cliente.replace(/\s+/g, '_')}.pdf`);
};

const ModuloContratos = () => null;
export default ModuloContratos;