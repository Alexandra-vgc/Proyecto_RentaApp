import React from 'react';

function Terminos() {

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '40px 20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', backgroundColor: '#fff', padding: '50px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
        
        {/* Botón para cerrar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
          <button 
            onClick={() => window.close()} 
            style={{ background: '#f8f9fa', border: '1px solid #ddd', padding: '8px 16px', borderRadius: '5px', color: '#444', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', transition: 'all 0.3s' }}
            title="Cerrar y volver al registro"
          >
            ✖ Cerrar pestaña
          </button>
        </div>

        <h1 style={{ color: '#2c3e50', fontSize: '28px', borderBottom: '3px solid #764ba2', paddingBottom: '15px', marginBottom: '20px' }}>
          Términos y Condiciones Generales de Uso
        </h1>
        
        <p style={{ color: '#7f8c8d', fontSize: '13px', marginBottom: '30px' }}>
          <strong>Última fecha de actualización:</strong> 3 de Marzo de 2026
        </p>

        <div style={{ color: '#444', fontSize: '15px', lineHeight: '1.8', textAlign: 'justify' }}>
          
          <p>
            Esta sección establece los términos y condiciones (en adelante, las "<strong>Condiciones Generales</strong>") para el uso de los contenidos y servicios de la plataforma tecnológica <strong>MiRentaApp</strong> (en adelante, la "<strong>Plataforma</strong>" o el "<strong>Sitio Web</strong>").
          </p>
          <p>
            Por favor, lea estas Condiciones Generales detenidamente antes de usar el Sitio Web, registrarse y/o utilizar nuestros servicios. La utilización por el usuario de la Plataforma se entenderá como <strong>aceptación plena y sin reservas</strong> de las Condiciones Generales aquí establecidas. Si usted no está de acuerdo con estas Condiciones, por favor no continúe utilizando el Sitio Web.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>1. Naturaleza del Servicio</h3>
          <p>
            MiRentaApp es una herramienta de software diseñada para facilitar la administración, comunicación y seguimiento de pagos entre <strong>Propietarios</strong> y sus respectivos clientes (<strong>Inquilinos</strong> o <strong>Compradores</strong>). MiRentaApp actúa única y exclusivamente como un <strong>proveedor de tecnología intermediario</strong>. En ningún momento MiRentaApp actúa como agente inmobiliario, corredor de bienes raíces, ni es parte contractual en los acuerdos de arriendo o compraventa generados a través de la plataforma.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>2. Registro y Cuentas de Usuario</h3>
          <p>
            Para acceder a los servicios, el Usuario deberá crear una cuenta proporcionando información veraz, actual y completa. En adelante, los términos "Usted" y "Usuario" harán referencia a todas las personas que se registren bajo los siguientes roles:
          </p>
          <ul style={{ paddingLeft: '20px', marginBottom: '20px' }}>
            <li style={{ marginBottom: '10px' }}><strong>Propietario/Administrador:</strong> Usuario con capacidad legal para ofertar propiedades, aprobar solicitudes y emitir contratos dentro del sistema.</li>
            <li style={{ marginBottom: '10px' }}><strong>Inquilino:</strong> Usuario que utiliza la plataforma para gestionar sus contratos de arrendamiento y registrar sus pagos mensuales.</li>
            <li style={{ marginBottom: '10px' }}><strong>Comprador:</strong> Usuario sujeto a un plan de pagos a plazos, quien utiliza la plataforma para monitorear el progreso de su compra y saldos pendientes.</li>
          </ul>
          <p>
            El Usuario es el único responsable de mantener la confidencialidad de su contraseña y de todas las actividades que ocurran bajo su cuenta.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>3. Limitación de Responsabilidad</h3>
          <p>
            Cualquier disputa legal, financiera, daño a la propiedad o incumplimiento de pagos que surja a partir de los contratos generados en MiRentaApp, es responsabilidad exclusiva entre las partes firmantes (Propietario y Cliente). La Plataforma no garantiza el estado de las propiedades ofertadas ni la solvencia económica de los usuarios registrados.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>4. Política de Privacidad y Manejo de Datos (LOPDP)</h3>
          <p>
            En estricto cumplimiento con la <strong>Ley Orgánica de Protección de Datos Personales (LOPDP)</strong> vigente en la República del Ecuador, MiRentaApp se compromete a salvaguardar la privacidad de sus Usuarios.
          </p>
          <p>
            Los datos recopilados (nombres, correos, información de contratos y registros de pago) son encriptados mediante protocolos de seguridad de estándar industrial (Bcrypt y JWT) y serán utilizados exclusivamente para el funcionamiento interno de la Plataforma y la generación de documentos en formato PDF. Sus datos no serán comercializados, cedidos ni transferidos a terceros con fines publicitarios sin su consentimiento expreso.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>5. Suspensión y Cancelación de Cuentas</h3>
          <p>
            MiRentaApp se reserva el derecho de suspender, temporal o definitivamente, a los Usuarios que infrinjan estas Condiciones Generales, proporcionen información falsa, o utilicen la plataforma para fines ilícitos o fraudulentos.
          </p>

          <h3 style={{ color: '#2c3e50', marginTop: '30px' }}>6. Legislación Aplicable y Jurisdicción</h3>
          <p>
            Las presentes Condiciones Generales se rigen por las leyes de la República del Ecuador. Para cualquier controversia legal derivada de la interpretación o ejecución de las presentes condiciones, las partes se someten a la jurisdicción de los jueces y tribunales competentes de la ciudad de <strong>Quito, Ecuador</strong>, renunciando a cualquier otro fuero que pudiera corresponderles.
          </p>
        </div>

      </div>
    </div>
  );
}

export default Terminos;