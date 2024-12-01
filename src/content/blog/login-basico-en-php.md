---
title: Login básico en PHP
description: Guía paso a paso para construir un login básico en PHP
pubDate: 2024-11-26
heroImage: /login-basico-en-php.png
tags: ["coding", "php"]
repo: https://github.com/j2deme/login-basico-php
---

## Introducción

Los sistemas de autenticación son una parte fundamental de cualquier aplicación que maneje información sensible, son especialmente útiles cuando se trata de controlar el acceso a ciertas áreas o datos de una aplicación.

En este tutorial, nos enfocaremos en construir un sistema de login básico para una aplicación web en PHP, que nos permita registrar usuarios y permitirles realizar acciones exclusivas al iniciar sesión.

Utilizaremos una base de datos para almacenar los usuarios y sus credenciales[^1], y aprenderemos a encriptar las contraseñas para garantizar la seguridad de la información.

[^1]: Se le denominan así a las credenciales de acceso, que generalmente son un nombre de usuario y una contraseña, aunque también pueden ser un correo electrónico, un número de teléfono, etc.

Como estaremos trabajando con PHP, complementaremos el control de acceso en la base de datos, con el uso de sesiones en el servidor, para mantener la autenticación del usuario durante su visita a la aplicación.

Consideraremos la siguiente idea para nuestra aplicación:

> Tendremos una aplicación web, que permitirá a los usuarios registrarse y publicar un mensaje en el "muro" de la aplicación, únicamente los usuarios registrados publicar mensajes.

<div class="info">
  <i class="ti ti-info-circle"></i>
  <p>Este tutorial asume que tienes conocimientos básicos de PHP y SQL.</p>
</div>

## Requisitos

Para seguir este tutorial, necesitamos:

- Un servidor web local (como Apache o Nginx)[^2]
- PHP 8.1 o superior
- Un sistema de gestión de bases de datos (como MySQL, PostgreSQL o SQLite)
- Un editor de código, como [Visual Studio Code](https://code.visualstudio.com/)
- El navegador web de tu elección.

Si tienes más experiencia, sin ningún problema puedes cambiar los requisitos por alternativas más potentes o avanzadas como un _hosting en la nube_, uno o más _containers_ de _Docker_, etc.

[^2]: Si no tienes experiencia con estos servicios, puedes utilizar un paquete de software que incluya todo lo necesario, como [XAMPP](https://www.apachefriends.org/index.html) o [WampServer](https://www.wampserver.com/).

### El servidor web y la base de datos

En mi caso y para ser más práctico, utilizaré el micro _server_ que proporciona PHP, puesto que este tutorial es para un _login_ básico y no necesitamos un servidor web completo.

```bash
cd /ruta/de/tu/proyecto
php -S localhost:8000
```

Para la base de datos utilizaré MySQL, pero puedes usar el motor de base de datos que prefieras, solo asegúrate de tenerlo instalado y configurado correctamente.

## Creando la base de datos

Aunque en la realidad las aplicaciones pueden tener muchas tablas y relaciones, para este tutorial solo necesitaremos una tabla para almacenar los usuarios.

Esto no significa que no puedas agregar más tablas o relaciones, construiremos una estructura básica para el _login_, que podrás expandir según tus necesidades.

```sql
CREATE DATABASE IF NOT EXISTS `login_basico_php`;

USE `login_basico_php`;

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `nombre` VARCHAR(100) NOT NULL,
  `apellidos` VARCHAR(150) NOT NULL,
  `mensaje` TEXT
);
```

**Nota:** Asegúrate de cambiar los valores de `usuario`, `password`, `email`, `nombre` y `mensaje` por los que necesites en tu aplicación.

Desglosemos la estructura de la tabla `usuarios`:

- `id`: Es un campo de tipo `INT` que se autoincrementa y es la clave primaria de la tabla, si bien no es estrictamente necesario, es una buena práctica tener un campo de este tipo en nuestras tablas.
- `email`: Es un campo de tipo `VARCHAR` que almacenará el correo electrónico del usuario, es un campo obligatorio y único, este campo funcionará como el nombre de usuario para iniciar sesión (aunque también podríamos usar un nombre de usuario separado).
- `password`: Almacenará la contraseña del usuario, es un campo obligatorio y se almacenará encriptado, es decir, no se almacenará en texto plano.[^3]
  - Utilizaremos el nombre de columna `password` en inglés para evitar detalles con los caracteres especiales en los nombres de las columnas.
- `nombre` y `apellidos`: Almacenan el nombre y los apellidos del usuario, para este tutorial los utilizaremos para personalizar el mensaje que se publicará en el muro, aunque propiamente no son necesarios para el _login_.
- `mensaje`: Almacena el mensaje que el usuario publicará en el muro, al igual que los campos anteriores, no es necesario para el _login_ pero lo utilizaremos para mostrar cómo se pueden agregar más campos a la tabla.

Una vez que hayas creado la base de datos y la tabla, podemos comenzar a trabajar en el código PHP para manejar el registro y el inicio de sesión de los usuarios.

[^3]: En este tutorial utilizaremos la función `password_hash` de PHP para encriptar las contraseñas, pero también podríamos utilizar otras técnicas como `bcrypt` o `argon2`.

## Estructura del proyecto

Para mantener las cosas organizadas, crearemos una estructura de directorios simple para nuestro proyecto:

```bash
login-basico-php/
├── assets/
│   ├── css/
│   │   └── app.css
│   └── js/
│       └── app.js
├── inc/
│   ├── db.php
│   ├── header.php
│   └── footer.php
├── index.php
├── login.php
├── login-procesa.php
├── register.php
├── register-procesa.php
├── dashboard.php
├── save-msg.php
└── logout.php
```

Si bien la estructura del proyecto es aparentemente extensa, en realidad es bastante simple:

- `assets/`: Contiene los archivos CSS y JavaScript para estilizar y agregar interactividad a la aplicación, estos archivos no son necesarios para el funcionamiento del _login_, pero son útiles para mejorar la experiencia del usuario.
- `inc/`: Contiene archivos PHP que incluiremos en nuestros scripts principales, como la conexión a la base de datos, la cabecera y el pie de página de la aplicación.
  - `db.php`: Contiene la conexión a la base de datos.
- `index.php`: Es la página de inicio de la aplicación, mostraremos los mensajes del muro.
- `login.php`: Contiene el formulario de inicio de sesión.
- `login-procesa.php`: Procesa el inicio de sesión del usuario.
- `register.php`: Contiene el formulario de registro de usuario.
- `register-procesa.php`: Procesa el registro de usuario.
- `dashboard.php`: Página de bienvenida para los usuarios autenticados, donde se mostrará el formulario para editar el mensaje del muro.
- `save-msg.php`: Procesa el guardado / actualización del mensaje en el muro.
- `logout.php`: Procesa el cierre de sesión del usuario.

## Diseño de la interfaz

Para mantener las cosas simples, utilizaremos un diseño básico para nuestra aplicación, sin embargo, puedes personalizarlo según tus necesidades.

Tomaremos como base el diseño que se revisó en el tutorial "[Cómo hacer un CRUD básico en PHP](../crud-php/#diseño-de-la-interfaz)" en cuanto al uso de la librería de estilos [PicoCSS](https://picocss.com/) y la separación de la plantilla en bloques, pero puedes utilizar cualquier otra librería o crear tu propio diseño.

Haremos uso de las capacidades de PHP para el manejo de plantillas dinámicas, de esta forma, podremos reutilizar el código HTML y PHP en diferentes partes de la aplicación.

## Conexión a la base de datos

Para conectarnos a la base de datos, crearemos un archivo `db.php` en el directorio `inc/` con el siguiente contenido:

```php title="inc/db.php" showLineNumbers
<?php
$host = 'localhost';
$dbname = 'login_basico_php';
$username = 'root';
$password = 'contraseñaSuperIndescifrable123';
$port = '3306';

try {
  $pdo = new PDO("mysql:host=$host;dbname=$dbname;port=$port", $username, $password);
  $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
  die("Error: " . $e->getMessage());
}
```

Este archivo contiene las credenciales de conexión a la base de datos, asegúrate de cambiar los valores de `$host`, `$dbname`, `$username` y `$password` por los que correspondan a tu configuración.

Igualmente, si utilizas un gestor de base de datos distinto, recuerda cambiar la cadena de conexión según corresponda.

## Muro de mensajes

El muro de mensajes es la página principal de nuestra aplicación, donde mostraremos los mensajes publicados por los usuarios registrados.

Es decir, que la información que se mostrará en esta página será pública, **pero** la edición de los mensajes solo estará disponible para los usuarios autenticados 🔑.

Estará compuesta por "el muro" donde se mostrarán los mensajes registrados y enlaces para iniciar sesión o registrarse.

```php title="index.php" showLineNumbers
<?php include 'inc/db.php'; ?>
<?php include 'inc/header.php'; ?>

<h2>Muro de mensajes</h2>

<section class="messages">
  <?php
  $sql = "SELECT * FROM usuarios WHERE mensaje IS NOT NULL";
  $stmt = $pdo->query($sql);

  if ($stmt->rowCount() > 0) {
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
      echo "<article class='message'>";
      echo "<p>{$row['mensaje']}</p>";
      echo "<small>{$row['nombre']} {$row['apellidos']}</small>";
      echo "</article>";
    }
  } else {
    echo "<article>No hay mensajes para mostrar.</article>";
  }
  ?>
</section>

<?php include 'inc/footer.php'; ?>
```

Analizemos el código propuesto:

- Incluimos el archivo `db.php` para establecer la conexión a la base de datos.
- Incluimos los archivos `header.php` y `footer.php` para mantener la estructura de la página.
- En el bloque principal, mostramos un encabezado `<h2>` con el título de la página, así como una sección `<section>` con la clase `messages` donde se mostrarán los mensajes.
  - Utilizaremos una consulta SQL para seleccionar todos los registros de la tabla `usuarios` donde el campo `mensaje` no sea nulo.
  - Si no hay mensajes para mostrar, se mostrará un mensaje indicando que no hay mensajes.

Agregaremos una barra de navegación en la parte superior de la página, para que los usuarios puedan iniciar sesión o registrarse.

Para ello, agregaremos la barra de navegación en el archivo `header.php`:

### Barra de navegación

En el archivo `header.php` incluiremos la barra de navegación que contendrá los enlaces para iniciar sesión y registrarse.

```php title="header.php" showLineNumbers /class="container"/ {19-26}
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login en PHP</title>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.green.min.css"
  >
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <header class="container">
    <nav>
      <a href="index.php">
        <h1>Login en PHP</h1>
      </a>
      <ul>
        <?php if (isset($_SESSION['user'])): ?>
          <li><a href="dashboard.php">Editar mensaje</a></li>
        <?php else: ?>
          <li><a href="login.php">Iniciar sesión</a></li>
          <li><a href="register.php">Registrarse</a></li>
        <?php endif; ?>
      </ul>
    </nav>
  </header>
  <main class="container">
```

Pongamos atención a los cambios:

- Nos aseguramos que el bloque `<main>` tenga la clase `container` para que el contenido se centre en la página.
- De la misma manera, agregamos un bloque `<header>` (también de clase `container`) antes del `<main>` donde incluiremos la barra de navegación.
- La barra de navegación esta compuesta por un encabezado `<h1>` y una lista `<ul>` con los enlaces (líneas **19**-**26**).
  - Se tendrá un enlace principal que llevará a la página principal (`index.php`).
  - Si el usuario ha iniciado sesión, se mostrará un enlace para editar el mensaje (`dashboard.php`).
  - Si el usuario no ha iniciado sesión, se mostrarán enlaces para iniciar sesión (`login.php`) y registrarse (`register.php`).

## Registro de usuarios

Antes de iniciar sesión, debemos tener usuarios registrados en el sistema, por lo que iniciaremos por crear el formulario de registro.

Este formulario contendrá campos para el correo electrónico, la contraseña, el nombre y los apellidos del usuario, y un botón para enviar los datos al servidor.

Crearemos un archivo `register.php` en la raíz del proyecto con el siguiente contenido:

```php title="register.php" showLineNumbers
<?php include 'inc/header.php'; ?>

<article class="form">
  <h2>Registro de usuario</h2>

  <form action="register-procesa.php" method="post">
    <fieldset>
      <label for="email">Correo electrónico</label>
      <input type="email" name="email" id="email" required />
    </fieldset>
    <fieldset>
      <label for="password">Contraseña</label>
      <input type="password" name="password" id="password" required />
    </fieldset>
    <fieldset>
      <label for="nombre">Nombre</label>
      <input type="text" name="nombre" id="nombre" required />
    </fieldset>
    <fieldset>
      <label for="apellidos">Apellidos</label>
      <input type="text" name="apellidos" id="apellidos" required />
    </fieldset>
    <button type="submit">Registrarse</button>
    <a href="index.php" role="button">Regresar</a>
  </form>
</article>

<?php include 'inc/footer.php'; ?>
```

Una vez que tenemos nuestro formulario de registro, debemos crear el script `register-procesa.php` para procesar los datos enviados por el usuario.

### Procesamiento del registro

En el archivo `register-procesa.php` obtendremos los datos enviados por el usuario, encriptaremos la contraseña y guardaremos el nuevo usuario en la base de datos.[^4]

[^4]: Aunque también es muy importante, para mantener breve este tutorial, omitiré la validación de campos, pero reitero, es **muy importante** validar los datos antes de guardarlos en la base de datos.

<div class="error">
  <i class="ti ti-alert-octagon"></i>
  <p>Deliberadamente se omitirán las validaciones de datos, pero esto <strong>NUNCA</strong> debe hacerse en producción.</p>
</div>

```php title="register-procesa.php" showLineNumbers
<?php
include 'inc/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = $_POST['email'];
  $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
  $nombre = $_POST['nombre'];
  $apellidos = $_POST['apellidos'];

  $sql = "INSERT INTO usuarios (email, password, nombre, apellidos) VALUES (:email, :password, :nombre, :apellidos)";
  $stmt = $pdo->prepare($sql);

  $stmt->execute([
    ':email' => $email,
    ':password' => $password,
    ':nombre' => $nombre,
    ':apellidos' => $apellidos
  ]);

  header('Location: login.php');
}
```

Desglosemos el código:

- Incluimos el archivo `db.php` para establecer la conexión a la base de datos.
- Verificamos que la solicitud sea de tipo `POST`, lo que indica que el formulario de registro ha sido enviado.
- Obtenemos los datos del formulario (`email`, `password`, `nombre` y `apellidos`).
  - Cada dato se obtiene y se asigna a una variable de manera individual, aunque también podría hacerse a través de una _desestructuración_.
  - En este caso, solo estamos obteniendo los datos, pero en producción deberíamos validarlos.
- Utilizamos la función `password_hash` de PHP para encriptar la contraseña antes de guardarla en la base de datos.
  - La función `password_hash` utiliza un algoritmo de encriptación seguro y genera un _hash_ aleatorio para cada contraseña, lo que mejora la seguridad de las contraseñas.[^5]
- Enseguida, preparamos nuestra consulta SQL para insertar un nuevo usuario en la tabla `usuarios` y la ejecutamos, pasando los valores correspondientes.
- Finalmente, redirigimos al usuario a la página de inicio de sesión (`login.php`).

[^5]: Para más información sobre la función `password_hash`, puedes consultar la [documentación oficial de PHP](https://www.php.net/manual/es/function.password-hash.php) o una guía como [esta](https://www.php.net/manual/es/faq.passwords.php).

## Inicio de sesión

Una vez que los usuarios se han registrado, necesitamos un formulario de inicio de sesión para que puedan acceder a la aplicación.

Crearemos un archivo `login.php` en la raíz del proyecto con el siguiente contenido:

```php title="login.php" showLineNumbers
<?php include 'inc/header.php'; ?>

<article class="form">
  <h2>Iniciar sesión</h2>

  <form action="login-procesa.php" method="post">
    <fieldset>
      <label for="email">Correo electrónico</label>
      <input type="email" name="email" id="email" required />
    </fieldset>
    <fieldset>
      <label for="password">Contraseña</label>
      <input type="password" name="password" id="password" required />
    </fieldset>
    <button type="submit">Iniciar sesión</button>
    <a href="index.php" role="button">Regresar</a>
  </form>
</article>

<?php include 'inc/footer.php'; ?>
```

Tendremos un formulario sencillo con campos para el correo electrónico y la contraseña, así como botones para enviar los datos y regresar a la página principal.

Para este tutorial, consideramos que las credenciales de acceso están formadas por el correo electrónico y la contraseña, pero si se requiere, el correo electrónico podría ser reemplazado por un nombre de usuario, un <abbr title="Registro Federal de Contribuyentes">RFC</abbr>, un <abbr title="Clave Única de Registro de Población">CURP</abbr>, número de teléfono, etc.

### Procesamiento del inicio de sesión

Al capturar las credenciales de acceso en `login.php` y presionar el botón para iniciar sesión, los datos se envían al script `login-procesa.php`, que se encargará de verificar las credenciales del usuario y, si son correctas, iniciar una sesión para mantener al usuario autenticado.

```php title="login-procesa.php" showLineNumbers /session_start()/ /password_verify(/ /$_SESSION/
<?php
session_start();
include 'inc/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  $email = $_POST['email'];
  $password = $_POST['password'];

  $sql = "SELECT * FROM usuarios WHERE email = :email";
  $stmt = $pdo->prepare($sql);

  $stmt->execute([':email' => $email]);
  $user = $stmt->fetch(PDO::FETCH_ASSOC);

  if ($user && password_verify($password, $user['password'])) {
    $_SESSION['user'] = $user;
    header('Location: dashboard.php');
  } else {
    header('Location: login.php');
  }
}
```

En general, el script `login-procesa.php` es muy sencillo, ya que principalmente verifica que se hayan recibido datos desde el formulario (línea **5**), los obtiene (líneas **6** y **7**) y consulta en la base de datos para verificar si el usuario existe y lo obtiene (líneas **9** a **13**).

Algunos elementos a destacar son:

- La función `session_start()` (línea **1**) es **necesaria** para iniciar una sesión en PHP y poder almacenar información del usuario autenticado.[^6]
  - La función `session_start()` debe ser llamada antes de cualquier salida al navegador, por lo que es común verla al inicio de los scripts PHP.
- La función `password_verify` (línea **15**) nos permite verificar si una contraseña en texto plano coincide con un _hash_ de contraseña almacenado en la base de datos.
  - Puesto que utilizamos `password_hash` para encriptar las contraseñas, es necesario utilizar `password_verify` para verificarlas.
- La variable `$_SESSION['user']` (línea **16**) se utiliza para almacenar la información del usuario autenticado y mantener la sesión activa, de esta forma, el usuario no tendrá que iniciar sesión en cada página que visite.
  - En este caso, almacenamos toda la información del usuario en la variable global[^7] `$_SESSION`, en el índice `['user']`, pero podríamos almacenar solo el `id` del usuario o cualquier otro dato específco que necesitemos.

Finalmente, si el usuario y la contraseña son correctos, se inicia una sesión y se redirige al usuario a la página de bienvenida (`dashboard.php`), de lo contrario, se redirige al usuario a la página de inicio de sesión (`login.php`).

[^6]: De hecho no sólo sirve para iniciar una sesión, también se puede utilizar para reanudar una sesión existente.
[^7]: La variable `$_SESSION` es un array asociativo que se utiliza para almacenar información de la sesión del usuario, como variables de sesión, mensajes de error, mensajes de éxito, etc.

<div class="info">
  <i class="ti ti-info-circle"></i>

Recuerda que si se utilizará la variable `$_SESSION` en un script, es necesario llamar a `session_start()` antes de acceder a la variable, de lo contrario, PHP no podrá acceder a la información de la sesión.

</div>

## Escribir en el muro

Una vez que el usuario ha iniciado sesión, podrá escribir un mensaje en el muro de la aplicación.

Crearemos un formulario simple en la página `dashboard.php` para que los usuarios autenticados puedan escribir su mensaje.

```php title="dashboard.php" showLineNumbers
<?php session_start(); ?>
<?php include 'inc/header.php'; ?>

<article class="form">
  <h2>Bienvenido, <?= $_SESSION['user']['nombre'] ?> <?= $_SESSION['user']['apellidos'] ?></h2>

  <form action="save-msg.php" method="post">
    <fieldset>
      <label for="mensaje">Mensaje</label>
      <textarea name="mensaje" id="mensaje" required></textarea>
    </fieldset>
    <button type="submit">Guardar mensaje</button>
  </form>
</article>

<?php include 'inc/footer.php'; ?>
```

Revisemos el código propuesto:

- Iniciamos inmediatamente una sesión (línea **1**) para poder acceder a la información del usuario autenticado.
- Incluimos los archivos `header.php` y `footer.php` para mantener la estructura de la página.
- Mostramos un mensaje de bienvenida personalizado (línea **5**) con el nombre y los apellidos del usuario autenticado, esto lo hacemos utilizando la información almacenada en `$_SESSION['user']`, que contiene los datos del usuario autenticado.
- Creamos un formulario con un campo de texto (`textarea`) para que el usuario pueda escribir su mensaje, mismo que será procesado por el script `save-msg.php` (líneas **7** - **13**).

```php caption="Estructura de la variable $_SESSION['user']"
Array
(
    [id] => 1
    [email] => "jesus.delgado@tecvalles.mx",
    [password] => "$2y$10$1Jd8dakso3",
    [nombre] => "Jaime",
    [apellidos] => "Delgado"
)
```

### Guardar el mensaje

Una vez que el usuario ha escrito su mensaje en el formulario y lo ha enviado, necesitamos un script para procesar y guardar el mensaje en la base de datos.

Crearemos un archivo `save-msg.php` en la raíz del proyecto con el siguiente contenido:

```php title="save-msg.php" showLineNumbers
<?php
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  include 'inc/db.php';

  $mensaje = $_POST['mensaje'];
  $id = $_SESSION['user']['id'];

  $sql = "UPDATE usuarios SET mensaje = :mensaje WHERE id = :id";
  $stmt = $pdo->prepare($sql);

  $stmt->execute([
    ':mensaje' => $mensaje,
    ':id' => $id
  ]);
  $_SESSION['user']['mensaje'] = $mensaje;
}
header('Location: index.php');
```

El script `save-msg.php` es bastante simple, ya que solo necesitamos obtener el mensaje del formulario (línea **5**), el `id` del usuario autenticado (línea **6**), preparar y ejecutar una consulta SQL para actualizar el campo `mensaje` del usuario autenticado (líneas **8** - **14**).

Agregamos (o actualizamos, según sea el caso) el mensaje del usuario a la variable `$_SESSION` y redirigimos al usuario hacia el muro de la aplicación, una vez que el mensaje ha sido guardado.

<div class="info">
  <i class="ti ti-info-circle"></i>

Es importante iniciar una sesión antes de acceder a la variable `$_SESSION`, de lo contrario, PHP no podrá acceder a la información de la sesión.

</div>

Podemos notar que el mensaje ya debe aparecer en nuestro muro 👏... sin embargo, algo raro sucede con la barra de navegación 🤔, ya que muestra enlaces diferentes.

Lo anterior es debido a que esas vistas no "abren" una sesión, es decir, no tienen forma de acceder a la variable `$_SESSION`, para solucionar esto, editaremos el archivo `header.php` y en la primera línea agregaremos el uso de la función `session_start()`:

```php title="inc/header.php" caption="Uso de session_start() en las vistas"
<?php session_start(); ?>
<!DOCTYPE html>
<html lang="es">
...
```

Un efecto colateral es que tendremos que quitar el `session_start()` de todas aquellas vistas donde lo hayamos puesto, como _p.e._ `dashboard.php`, de lo contrario, nos devolverá un mensaje similar al siguiente:

```bash
Notice: session_start(): Ignoring session_start() because a session is already active
```

Adicionalmente, ya que estamos en el archivo `dashboard.php`, haremos una pequeña modificación para mostrar el mensaje guardado en el muro.

```php title="dashboard.php" showLineNumbers
<?php session_start(); ?> // [!code --]
<?php include 'inc/header.php'; ?>

<article class="form">
  <h2>Bienvenido, <?= $_SESSION['user']['nombre'] ?> <?= $_SESSION['user']['apellidos'] ?></h2>

  <form action="save-msg.php" method="post">
    <fieldset>
      <label for="mensaje">Mensaje</label>
      <textarea name="mensaje" id="mensaje" required></textarea> // [!code --]
      <textarea name="mensaje" id="mensaje" required><?= $_SESSION['user']['mensaje'] ?? "" ?></textarea> // [!code ++]
    </fieldset>
    <button type="submit">Guardar mensaje</button>
  </form>
</article>

<?php include 'inc/footer.php'; ?>
```

Primero retiramos el `session_start()` que ahora esta incluído en `header.php`, para evitar el mensaje de PHP, posteriormente modificamos el `textarea` para que en su interior muestre la información del mensaje del usuario autenticado, si es que existe, de lo contrario, mostrará una cadena vacía.

Si ahora guardamos un mensaje en el muro, al regresar a la página de inicio, veremos el mensaje que acabamos de guardar 👍, así como la barra de navegación con los enlaces correctos.

## Cerrar sesión

Proveer una forma de cerrar sesión es una parte importante de cualquier sistema de autenticación, ya que permite a los usuarios cerrar su sesión y proteger su información.

Crearemos un script `logout.php` en la raíz del proyecto con el siguiente contenido:

```php title="logout.php" showLineNumbers
<?php
session_start();
session_destroy();
header('Location: index.php');
```

El script `logout.php` es **muy** simple, ya que solo necesitamos destruir la sesión actual y redirigir al usuario a la página de inicio (`index.php`), de esta forma, el usuario habrá cerrado su sesión y no podrá acceder a las páginas protegidas sin iniciar sesión nuevamente.

Este script lo activaremos desde un enlace nuevo en la barra de navegación:

```php title="inc/header.php" showLineNumbers
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Login en PHP</title>
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.green.min.css"
  >
  <link rel="stylesheet" href="assets/css/style.css" />
</head>
<body>
  <header class="container">
    <nav>
      <a href="index.php">
        <h1>Login en PHP</h1>
      </a>
      <ul>
        <?php if (isset($_SESSION['user'])): ?>
          <li><a href="dashboard.php">Editar mensaje</a></li>
          <li><a href="logout.php">Cerrar sesión</a></li> // [!code ++]
        <?php else: ?>
          <li><a href="login.php">Iniciar sesión</a></li>
          <li><a href="register.php">Registrarse</a></li>
        <?php endif; ?>
      </ul>
    </nav>
  </header>
  <main class="container">
```

Prácticamente podríamos decir que hemos finalizado nuestro sistema de login, sin embargo, puesto que ya tenemos la estructura básica, podemos agregar algunas mejoras para hacerlo más atractivo y funcional.

### Mejoras adicionales

Es lógico suponer que ciertas zonas de nuestra aplicación serán públicas (_p.e._ el muro, el formulario de registro, el formulario de inicio de sesión, etc.), mientras que otras **deben** estar protegidas detrás de un inicio de sesión.

Por lo anterior, agregaremos un pequeño script que nos permitirá "bloquear" el acceso a scripts y páginas, que requieran tener iniciada la sesión.

```php
<?php if (!isset($_SESSION['user'])) header('Location: login.php'); ?>
```

Este script verifica si existe información de algún usuario en la variable `$_SESSION`, de lo contrario, redirige al visitante a la pantalla de inicio de sesión, esto es muy útil para añadir una capa de seguridad a nuestra aplicación.

Ubicaremos esta pequeña línea de código, en cada script PHP donde queramos evitar accesos sin permisos, justo debajo de la función `session_start()`:

```php caption="Verificación en vistas y formularios"
<?php session_start(); ?>
<?php if (!isset($_SESSION['user'])) header('Location: login.php'); ?>
```

```php caption="Verificación en archivos de procesamiento"
<?php
session_start();
if (!isset($_SESSION['user'])) header('Location: login.php');
```

### Detalles finales

Agregaremos algunos estilos CSS en el archivo `assets/css/app.css`, para mejorar algunas secciones:

```css title="assets/css/app.css"
.form {
  max-width: 80ch;
  margin: 0 auto;
}

.form label {
  font-weight: bold;
}

.messages {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-around;
}

.message {
  padding: 1rem;
  border: 1px solid #dad4c2;
  border-radius: 0.5rem;
  min-width: 25%;
}

.message p {
  margin: 0;
}

.message small {
  position: relative;
  display: block;
  text-align: right;
  margin-top: 0.5rem;
  font-style: italic;
}
```

## _Et voilá!_

Ahora podemos crear algunas cuentas y editar los mensajes de cada usuario, para ver el resultado en el muro compartido.

![Resultado: Login básico en PHP](/login-basico-en-php.png)

**¡Listo!** 🎉 hemos finalizado este tutorial y aprendimos como hacer un login básico utilizando PHP.

Como se mencionó desde el inicio de este tutorial, definitivamente hay muchas cosas que se pueden añadir en los ámbitos de validación de datos, seguridad y otros elementos funcionales.

Sin embargo, el código revisado nos puede ayudar a tener una estructura base para otros proyectos más extensos 😁.
