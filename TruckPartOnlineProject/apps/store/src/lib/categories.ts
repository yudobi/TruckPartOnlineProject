type Subcategory = {
  code: string;
  name: string;
  shortName: string;
  shortNameEn: string;
  description?: string;
};

type Category = {
  code: string;
  name: string;
  shortName: string;
  shortNameEn: string;
  subcategories: Subcategory[];
};

const categories: Category[] = [
  {
    code: "A",
    name: "SISTEMAS MECÁNICOS PRINCIPALES",
    shortName: "Mecánicos",
    shortNameEn: "Mechanical",
    subcategories: [
      {
        code: "A1",
        name: "SISTEMA MOTOR - PROPULSIÓN",
        shortName: "Motor",
        shortNameEn: "Engine",
        description: "Incluye todos los componentes del motor y sus sistemas asociados"
      },
      {
        code: "A2",
        name: "TRANSMISIÓN - TREN MOTRIZ",
        shortName: "Transmisión",
        shortNameEn: "Transmission",
        description: "Componentes de transmisión y sistemas de tracción"
      }
    ]
  },
  {
    code: "B",
    name: "SISTEMAS DE CONTROL Y SEGURIDAD",
    shortName: "Control",
    shortNameEn: "Control",
    subcategories: [
      {
        code: "B1",
        name: "SISTEMA DE DIRECCIÓN",
        shortName: "Dirección",
        shortNameEn: "Steering",
        description: "Componentes de dirección mecánica, hidráulica y electrónica"
      },
      {
        code: "B2",
        name: "SISTEMA DE FRENOS",
        shortName: "Frenos",
        shortNameEn: "Brakes",
        description: "Sistemas de frenado convencionales y electrónicos"
      },
      {
        code: "B3",
        name: "SISTEMA DE SUSPENSIÓN",
        shortName: "Suspensión",
        shortNameEn: "Suspension",
        description: "Componentes de suspensión y amortiguación"
      }
    ]
  },
  {
    code: "C",
    name: "SISTEMAS ELÉCTRICOS Y ELECTRÓNICOS",
    shortName: "Eléctrico",
    shortNameEn: "Electrical",
    subcategories: [
      {
        code: "C1",
        name: "GENERACIÓN, ARRANQUE Y ALMACENAMIENTO",
        shortName: "Generación",
        shortNameEn: "Power",
        description: "Sistemas de generación y almacenamiento de energía"
      },
      {
        code: "C2",
        name: "IGNICIÓN Y GESTIÓN DEL MOTOR",
        shortName: "Ignición",
        shortNameEn: "Ignition",
        description: "Sistemas de encendido y gestión para motores a gasolina/gas"
      },
      {
        code: "C3",
        name: "RED ELÉCTRICA Y PROTECCIÓN",
        shortName: "Red eléctrica",
        shortNameEn: "Wiring",
        description: "Cableado, fusibles y sistemas de protección"
      },
      {
        code: "C4",
        name: "ILUMINACIÓN Y SEÑALIZACIÓN",
        shortName: "Luces",
        shortNameEn: "Lighting",
        description: "Sistemas de iluminación y señalización"
      },
      {
        code: "C5",
        name: "SENSORES Y MÓDULOS DE CONTROL",
        shortName: "Sensores",
        shortNameEn: "Sensors",
        description: "Sensores y unidades de control electrónico"
      },
      {
        code: "C6",
        name: "CONECTIVIDAD Y TELECOMUNICACIONES",
        shortName: "Conectividad",
        shortNameEn: "Connectivity",
        description: "Sistemas de comunicación y navegación"
      }
    ]
  },
  {
    code: "D",
    name: "ESTRUCTURA, CARROCERÍA Y CARGA",
    shortName: "Carrocería",
    shortNameEn: "Body",
    subcategories: [
      {
        code: "D1",
        name: "CHASIS Y BASTIDOR",
        shortName: "Chasis",
        shortNameEn: "Chassis",
        description: "Estructura principal del vehículo"
      },
      {
        code: "D2",
        name: "CABINA",
        shortName: "Cabina",
        shortNameEn: "Cabin",
        description: "Componentes de la cabina del conductor"
      },
      {
        code: "D3",
        name: "CARROCERÍA Y EQUIPO DE CARGA",
        shortName: "Carga",
        shortNameEn: "Cargo",
        description: "Componentes para el transporte de carga"
      }
    ]
  },
  {
    code: "E",
    name: "NEUMÁTICOS, RUEDAS Y RODAMIENTOS",
    shortName: "Neumáticos",
    shortNameEn: "Tires",
    subcategories: [
      {
        code: "E1",
        name: "NEUMÁTICOS",
        shortName: "Neumáticos",
        shortNameEn: "Tires",
        description: "Neumáticos nuevos y recauchados"
      },
      {
        code: "E2",
        name: "RUEDAS Y COMPONENTES",
        shortName: "Ruedas",
        shortNameEn: "Wheels",
        description: "Rines y componentes de rueda"
      },
      {
        code: "E3",
        name: "RODAMIENTOS Y SELLOS",
        shortName: "Rodamientos",
        shortNameEn: "Bearings",
        description: "Rodamientos y sellos para ejes"
      }
    ]
  },
  {
    code: "F",
    name: "CONFORT, CLIMATIZACIÓN Y ACCESORIOS",
    shortName: "Confort",
    shortNameEn: "Comfort",
    subcategories: [
      {
        code: "F1",
        name: "CLIMATIZACIÓN DE LA CABINA (HVAC)",
        shortName: "Climatización",
        shortNameEn: "HVAC",
        description: "Sistemas de calefacción y aire acondicionado"
      },
      {
        code: "F2",
        name: "ASIENTOS Y ERGONOMÍA",
        shortName: "Asientos",
        shortNameEn: "Seats",
        description: "Asientos y sistemas de ajuste"
      },
      {
        code: "F3",
        name: "INSTRUMENTACIÓN Y CONTROLES",
        shortName: "Instrumentos",
        shortNameEn: "Instruments",
        description: "Cuadros de instrumentos y controles"
      },
      {
        code: "F4",
        name: "ACCESORIOS Y MEJORAS",
        shortName: "Accesorios",
        shortNameEn: "Accessories",
        description: "Accesorios y mejoras para el vehículo"
      }
    ]
  },
  {
    code: "G",
    name: "CONSUMIBLES, FLUIDOS Y MANTENIMIENTO",
    shortName: "Consumibles",
    shortNameEn: "Consumables",
    subcategories: [
      {
        code: "G1",
        name: "FILTROS",
        shortName: "Filtros",
        shortNameEn: "Filters",
        description: "Filtros para diferentes sistemas del vehículo"
      },
      {
        code: "G2",
        name: "FLUIDOS Y LUBRICANTES",
        shortName: "Líquidos",
        shortNameEn: "Fluids",
        description: "Aceites y líquidos para mantenimiento"
      },
      {
        code: "G3",
        name: "PRODUCTOS QUÍMICOS Y ADHESIVOS",
        shortName: "Químicos",
        shortNameEn: "Chemicals",
        description: "Productos químicos para mantenimiento"
      },
      {
        code: "G4",
        name: "PINTURA Y PROTECCIÓN",
        shortName: "Pintura",
        shortNameEn: "Paint",
        description: "Pinturas y productos de protección"
      }
    ]
  },
  {
    code: "H",
    name: "HERRAMIENTAS, EQUIPAMIENTO Y SEGURIDAD",
    shortName: "Herramientas",
    shortNameEn: "Tools",
    subcategories: [
      {
        code: "H1",
        name: "HERRAMIENTAS PARA CAMIÓN Y TALLER",
        shortName: "Herramientas",
        shortNameEn: "Tools",
        description: "Herramientas para mantenimiento"
      },
      {
        code: "H2",
        name: "EQUIPO DE DIAGNÓSTICO Y PRECISIÓN",
        shortName: "Diagnóstico",
        shortNameEn: "Diagnostics",
        description: "Equipos de diagnóstico y medición"
      },
      {
        code: "H3",
        name: "EQUIPO DE SEGURIDAD Y SEÑALIZACIÓN",
        shortName: "Seguridad",
        shortNameEn: "Safety",
        description: "Equipo de seguridad vial y señalización"
      }
    ]
  }
];

export type { Category, Subcategory };
export default categories;
