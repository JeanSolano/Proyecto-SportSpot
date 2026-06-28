// Planes de suscripción (modelo híbrido: cuota mensual + comisión por reserva).
// Solo mock por ahora — los precios y límites son ilustrativos.

export const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: 9.99,
    maxEstablishments: 1,
    commission: 8,
    accent: '#56B330',
    tagline: 'Para empezar con un establecimiento.',
    features: [
      '1 establecimiento',
      'Canchas y horarios ilimitados',
      'Reservas desde la app móvil',
      'Soporte por correo',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 24.99,
    maxEstablishments: 3,
    commission: 6,
    accent: '#1E7FE0',
    popular: true,
    tagline: 'Para negocios en crecimiento.',
    features: [
      'Hasta 3 establecimientos',
      'Menor comisión por reserva',
      'Publicaciones y promociones',
      'Soporte prioritario',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 49.99,
    maxEstablishments: 10,
    commission: 4,
    accent: '#1B2880',
    tagline: 'Para cadenas y complejos deportivos.',
    features: [
      'Hasta 10 establecimientos',
      'La comisión más baja',
      'Métricas y reportes avanzados',
      'Soporte dedicado',
    ],
  },
];

export const planById = (id) => PLANS.find((p) => p.id === id) ?? null;
