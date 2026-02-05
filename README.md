# 🔵 EGAR.io v1.0

**Esta GUIA esta hecha para usuarios de Windows si eres de otro sistema vas a tener que buscar por tu cuenta, pero sera el mismo resultado.**

**EGAR.io** es una versión personalizada y optimizada del clásico juego de celdas, diseñada específicamente para redes locales (LAN). Desarrollado con **Node.js**, **Socket.io** y **HTML5 Canvas**, ofrece una experiencia fluida a 60 FPS con alta personalización de skins y configuraciones visuales persistentes.

## 🚀 Características Principales

* **🎮 Rendimiento de Élite:** Renderizado mediante `requestAnimationFrame` para asegurar 60 FPS constantes y eliminar el lag visual.
* **🎨 Personalización Total:**
    * Skins lisas o con degradados dinámicos.
    * Colores de nombre personalizables (Sólido/Degradado).
    * Efectos visuales especiales (Brillo Neón y Estrellas).
* **⚙️ Menú de Ajustes Avanzado:**
    * Cambio de fondo (Color o Imagen por URL).
    * Control de opacidad de la grilla y oscuridad del mapa (dentro y fuera).
    * Configuración del color de la comida (Aleatorio o Fijo).
* **👁️ Modo Espectador:** El menú principal alterna automáticamente la cámara entre los jugadores activos cada 3 segundos.
* **💾 Persistencia:** Todas tus configuraciones (Nombre, Skin, Colores, Ajustes de fondo) se guardan en el navegador mediante `localStorage`.
* **🏷️ Nombres Aleatorios:** Si no eliges un nombre, el servidor te asignará uno al azar de la lista en `namelists.txt`.

## 🛠️ Requisitos Previos

* [Node.js](https://nodejs.org/) (Versión 18 o superior).
* Navegador web moderno (Chrome, Edge o Firefox).

## 📦 Instalación y Ejecución

1.  Abrir una terminal en la ruta del proyecto:

    ```bash
    cd C:\Proyectos\EGAR.io
    ```

2.  Instalar las dependencias necesarias:

    ```bash
    npm install express socket.io
    ```

3.  Iniciar el servidor:

    ```bash
    node server.js
    ```

4.  Abrir el juego en el navegador: `http://localhost:3000`

## 🌐 Cómo jugar en LAN

1.  Busca tu IP local con el comando `ipconfig` (ejemplo: `192.168.1.15`).
2.  Asegúrate de que todos los dispositivos estén en la **misma red Wi-Fi**.
3.  Los invitados deben entrar a: `http://TU_IP_LOCAL:3000`.
4.  **Firewall:** Si hay problemas de conexión, permite el tráfico entrante para Node.js en la configuración de seguridad de Windows.

## 🌍 Jugar por Internet (Cloudflare Tunnel)

Si quieres que tus amigos se unan a **EGAR.io** desde fuera de tu red local (a través de Internet) sin necesidad de abrir puertos en tu router ni configurar DNS complejos, la mejor opción es usar un túnel de Cloudflare.

### 1. Instalación
1. Descarga el ejecutable de **cloudflared** según tu sistema operativo desde la [página oficial de descargas de Cloudflare](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/).
2. En Windows, ejecuta el instalador `.msi` y sigue los pasos.

### 2. Creación del Túnel
Para exponer tu servidor local a la red global:

1. Inicia el servidor de tu juego desde la terminal de VS Code:

   ```bash
   node server.js
   ```

2. Abre una segunda terminal (sin cerrar la anterior) y ejecuta el siguiente comando:

    ```Bash
    cloudflared tunnel --url http://localhost:3000
    ```

3. Conexión y Compartir
Una vez ejecutado el comando, busca en la terminal una sección de texto que contenga tu URL temporal:

Your single-use URL is: https://un-nombre-aleatorio.trycloudflare.com

Comparte ese enlace con tus amigos por cualquier medio.

Aviso: No cierres la terminal de cloudflared ni la de node server.js durante la sesión de juego; si cierras alguna, el túnel o el servidor dejarán de funcionar.

## ⚠️ Consideraciones de EGAR.io en la Nube
Soporte nativo de WebSockets: Cloudflare Tunnel es compatible con el protocolo de Socket.io por defecto, lo que garantiza que el movimiento de las celdas sea fluido.

Privacidad: Este método protege tu red doméstica ya que oculta tu dirección IP pública real bajo el dominio de Cloudflare.

Persistencia: Ten en cuenta que cada vez que reinicies el comando del túnel, la URL generada será distinta (a menos que configures un dominio propio en el panel de Cloudflare).

## 📁 Estructura del Proyecto

```text
LanPlace/
├── server.js           # Servidor (Lógica y WebSockets)
├── README.md           # Documentación del proyecto
├── LICENSE             # Licencia GNU GPL-3.0
├── .gitignore          # El gitignore de git
└── public/             # Cliente
    ├── index.html      # Interfaz de usuario
    ├── style.css       # Estilos y diseño responsivo
    ├── script.js       # Motor gráfico y lógica de red
    ├── namelists.txt   # Base de datos de nombres aleatorios
    └── favicon.ico     # Icono de pestaña
```

## 🕹️ Controles

* **Mouse**: Dirige el movimiento de tu celda.

* **Tactil/Tocar**: Dirige el movimiento de tu celda.

* **Jugar**: Inicia la partida guardando tu configuración actual.

* **Config (⚙️)**:  Personaliza la estética del campo de juego y la comida.

* **Salir**: Regresa al menú (tu configuración se mantiene para la próxima vez).

## 🧰  Herramientas utilizadas:

* **Desarrollo**: Visual Studio Code y Node JS
* **Recursos**: LibreSprite
* **Utilidades**: 7zip y Git