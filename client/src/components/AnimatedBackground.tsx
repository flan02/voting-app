// components/AnimatedBackground.tsx
import React from "react";
import { loadFull } from "tsparticles";
import Particles from "react-tsparticles";
import { Engine } from "tsparticles-engine";

const AnimatedBackground = () => {
  const particlesInit = async (main: any) => {
    // Puedes personalizar la animación cargando presets adicionales aquí
    try {
      await loadFull(main);
    } catch (error) {
      console.error(error);
    }
  };

  const particlesOptions = {
    background: {
      color: {
        value: "transparent", // Fondo transparente para adaptarlo a tu modo claro/oscuro
      },
    },
    particles: {
      color: {
        value: "#000000", // Cambia el color de las partículas
      },
      move: {
        enable: true,
        speed: 2,
      },
      size: {
        value: 3,
      },
      links: {
        enable: true,
        color: "#ffffff", // Color de los enlaces entre partículas
      },
    },
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={particlesOptions}
      className="absolute inset-0 -z-10" // Para posicionar las partículas detrás del contenido
    />
  );
};

export default AnimatedBackground;
