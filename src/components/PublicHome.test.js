import { render, screen, fireEvent } from '@testing-library/react';
import PublicHome from './PublicHome';
import '@testing-library/jest-dom';

// SIMULACIÓN DE ENTORNO SEGURO: Mock de Axios para no tocar la base de datos real
import axios from 'axios';
jest.mock('axios');


const mockPropiedades = [
  { id: 1, ciudad: "Quito", precio: 500, tipo_operacion: "Alquilar", habitaciones: 2, sector: "Norte" },
  { id: 2, ciudad: "Guayaquil", precio: 1200, tipo_operacion: "Comprar", habitaciones: 3, sector: "Samborondón" }
];

describe('Pruebas Unitarias - MiRentaAPP', () => {
  
  test('Debe mostrar el mensaje "Filtro no encontrado" cuando no hay coincidencias', async () => {
    // 1. Simulamos que la API devuelve nuestros datos de prueba
    axios.get.mockResolvedValue({ data: mockPropiedades });

    render(<PublicHome />);

    // 2. Simulamos que el usuario escribe una ciudad que no existe
    const inputBusqueda = screen.getByPlaceholderText(/Ingresa zona/i);
    fireEvent.change(inputBusqueda, { target: { value: 'Cuenca' } });

    // 3. Verificamos que aparezca el mensaje de error de búsqueda
    const mensajeError = await screen.findByText(/Filtro no encontrado/i);
    expect(mensajeError).toBeInTheDocument();
  });

  test('Debe detectar y filtrar correctamente por precio máximo', async () => {
    axios.get.mockResolvedValue({ data: mockPropiedades });
    render(<PublicHome />);

    // Simulamos escribir un precio máximo de 600
    const inputPrecio = screen.getByPlaceholderText(/Ej: 1000/i);
    fireEvent.change(inputPrecio, { target: { value: '600' } });

    // Solo debería quedar el departamento de 500 (Quito)
    const precioVisible = await screen.findByText(/USD 500/i);
    expect(precioVisible).toBeInTheDocument();
    
    // El de 1200 no debería estar
    const precioInvisble = screen.queryByText(/USD 1200/i);
    expect(precioInvisble).not.toBeInTheDocument();
  });
});