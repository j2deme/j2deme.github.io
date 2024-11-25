---
title: "CRUD básico en PHP"
description: "Guía paso a paso para crear un CRUD básico en PHP"
pubDate: "2024/11/24"
heroImage: "/blog-placeholder-1.jpg"
tags: ["php", "coding"]
draft: false
---

## Introducción

> Un **CRUD** es un acrónimo que significa **C**reate, **R**ead, **U**pdate y **D**elete.

Es un conjunto de operaciones básicas que se pueden realizar en una base de datos o en un sistema de gestión de bases de datos relacionales, y suele ser la base de cualquier aplicación, ya que permite al usuario interactuar con la información almacenada en la base de datos.

En este tutorial trabajaremos un CRUD básico en PHP, utilizando MySQL como sistema de gestión de bases de datos (aunque puede cambiarse a otro <abbr title="Sistema Gestor de Base de Datos">SGBD</abbr> si se desea).

<div class="info">
  <i class="ti ti-info-circle"></i>
  <p>Este tutorial asume que tienes conocimientos básicos de PHP y SQL.</p>
</div>

## Requisitos

Para poder seguir este tutorial necesitamos tener instalado:

- Un servidor web (como Apache) [^1]
- PHP 8.1 o superior
- Un sistema de gestión de bases de datos (como MySQL, PostgreSQL o SQLite)
- Un editor de código, como [Visual Studio Code](https://code.visualstudio.com/)
- El navegador web de tu elección.

Claramente, todos los requisitos pueden cambiarse por alternativas más potentes o avanzadas como un _hosting en la nube_, un _container_ de _Docker_, etc., pero para este tutorial, nos enfocaremos en lo básico.

### Sobre el servidor web

No entraré a los detalles de como levantar el servidor y _servir_ nuestro proyecto desde Apache, XAMPP o WAMP, aunque si contamos con PHP instalado en nuestra línea de comandos, esto se puede hacer realmente fácil.

```bash
cd /ruta/a/mi/proyecto
php -S localhost:8000
```

Con esto, tendremos un servidor web corriendo en el puerto `8000` y podremos acceder a nuestro proyecto en `http://localhost:8000`.

[^1]: Si no tienes un servidor web instalado, puedes usar [XAMPP](https://www.apachefriends.org/index.html) o [WampServer](https://www.wampserver.com/en/), que incluyen Apache, PHP y MySQL.

## Crear la base de datos

Antes de empezar a codificar, necesitamos crear la base de datos que vamos a utilizar, en este caso, trabajaré con MySQL aunque en realidad puedes usar cualquier sistema de gestión de bases de datos.

```sql
CREATE DATABASE crud_php;
USE crud_php;

-- Crearemos una tabla llamada `users` con los siguientes campos
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Nota:** Asegurate de ajustar la sintaxis, nombres y tipos de datos según tu sistema de gestión de bases de datos.

Una vez que hemos creado la base de datos y la tabla, podemos empezar a codificar el CRUD.

## Estructura del proyecto

Para mantener las cosas organizadas, crearemos una estructura de directorios simple para nuestra aplicación:

```bash
crud-php/
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
├── new.php
├── save.php
├── view.php
├── update.php
└── delete.php
```

- El directorio `assets` contendrá los archivos CSS y JavaScript.
- El directorio `inc` contendrá los archivos _parciales_ que se incluirán en las páginas principales.
  - El archivo `db.php` contendrá la conexión a la base de datos.
- Los archivos `index.php`, `new.php`, `save.php`, `view.php`, `update.php` y `delete.php` contendrán el código PHP para las operaciones CRUD.
  - Si tuvieramos más tablas, sería recomendable agregar un prefijo o sufijo al nombre del archivo para identificar la tabla con la que trabaja. _P.e._ `users_index.php`, `products_index.php`, etc.

## Diseño de la aplicación

Puesto que no es el objetivo de este tutorial, no entraremos mucho en temas de diseño, utilizaremos la estructura básica propuesta por el micro framework [PicoCSS](https://picocss.com/), para que se aplique un diseño simple y limpio a nuestra aplicación.

Vamos a empezar por separar nuestro _layout_ en dos archivos: `header.php` y `footer.php`.

<!-- prettier-ignore-start -->
```html title="inc/header.php"
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>CRUD en PHP</title>
    <!-- Utilice la versión default de PicoCSS pero puedes elegir otro color -->
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css"
    >
    <link rel="stylesheet" href="assets/css/style.css" />
  </head>
  <body>
    <header>
      <h1>Gestor de Usuarios</h1>
    </header>
    <main class="container">
```

```html title="inc/footer.php"
    </main>
    <footer>
      <p>&copy; 2024 - Todos los derechos reservados</p>
    </footer>
  </body>
</html>
```
<!-- prettier-ignore-end -->

Reutilizaremos estos archivos en cada página para mantener la consistencia en el diseño.

## Conexión a la base de datos

Para conectarnos a la base de datos, crearemos un archivo llamado `db.php` en el directorio `inc`:

```php title="inc/db.php"
<?php
$host = 'localhost'; // Cambiar si es necesario
$dbname = 'crud_php'; // Nombre de la base de datos
$username = 'root'; // Usuario de la base de datos
$password = 'miPasswordIndescifrable2024'; // Contraseña de la base de datos

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Error: " . $e->getMessage());
}
```

<div  class="warning">
  <i class="ti ti-alert-triangle"></i>
  <p>El servidor de base de datos debe estar en ejecución, de lo contrario la conexión no podrá establecerse.</p>
</div>

En este código, estamos creando una instancia de la clase `PDO` de PHP y estableciendo el modo de error a `ERRMODE_EXCEPTION`, lo que nos permitirá capturar cualquier error que ocurra durante la ejecución de las consultas SQL.

Dado que estamos usando MySQL, bien podríamos usar la extensión `mysqli` de PHP, pero con la intención de mantener el código compatible con otros gestores de bases de datos nos mantendremos con `PDO`.[^2]

[^2]: Mientras que `mysqli` es específica para MySQL, `PDO` proporciona una interfaz de acceso a la base de datos que es independiente del gestor de base de datos, además de tener algunas [otras diferencias](https://websitebeaver.com/php-pdo-vs-mysqli).

Cabe mencionar que la clase `PDO` se incorporó desde la versión 5.1 de PHP como una alternativa segura y eficiente para conectarse a la base de datos, y se ha convertido en la forma recomendada de interactuar con la base de datos en PHP.[^3]

[^3]: Con la publicación de [PHP 8.4](https://www.php.net/releases/8.4/es.php) se mantienen las mejoras en la clase `PDO` y se añaden algunas nuevas características.

<div class="info">
  <i class="ti ti-info-circle"></i>
  <p>De la misma manera que se usa <code>mysql</code> en la cadena de conexión, se puede usar otro gestor, como <code>pgsql</code> o <code>sqlite</code>.</p>
</div>

## Listar usuarios

Empezaremos por listar los usuarios que tenemos en la base de datos, para ello, crearemos un archivo llamado `index.php` en la raíz del proyecto (o lo editamos, si ya lo habías creado):

```php title="index.php" showLineNumbers
<?php
require_once 'inc/db.php';

$stmt = $pdo->query('SELECT * FROM users');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<?php include_once 'inc/header.php'; ?>
<h2>Lista de Usuarios</h2>

<div class="overflow">
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Nombre</th>
        <th>Email</th>
        <th>Fecha de Creación</th>
        <th>Acciones</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach($users as $user):?>
      <tr>
        <td><?= $user['id']; ?></td>
        <td><?= $user['name']; ?></td>
        <td><?= $user['email']; ?></td>
        <td><?= $user['created_at']; ?></td>
        <td>
          <a href="update.php?id=<?= $user['id']; ?>">Editar</a>
          <a href="delete.php?id=<?= $user['id']; ?>">Eliminar</a>
        </td>
      </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</div>

<?php include_once 'inc/footer.php'; ?>
```

Vamos a desglosar el código:

- La línea **2** incluye el archivo `db.php` que contiene la conexión a la base de datos, se utiliza `require_once` para asegurarnos de que el archivo se incluya solo una vez y si no se encuentra, se detiene la ejecución del script.
- La línea **4** ejecuta una consulta SQL para seleccionar todos los registros de la tabla `users`, el resultado se almacena en la variable `$stmt`.
- La línea **5** obtiene todas las filas del resultado como un array asociativo y lo almacena en la variable `$users`. [^4]
- Las líneas **23-34** generan una nueva fila en la tabla HTML para cada usuario en el array `$users`, mostrando los datos de cada usuario en las columnas correspondientes.
- En las líneas **29-32** se crean enlaces para editar y eliminar cada usuario, pasando el `id` del usuario como parámetro en la URL (lo usaremos más adelante).

[^4]: Que sea un array asociativo significa que los índices del array son los nombres de las columnas de la tabla, lo que es más fácil de leer y entender.

## Crear un nuevo usuario

Continuaremos con la creación de un nuevo usuario, para ello, trabajaremos en el archivo `new.php` en la raíz del proyecto, este archivo contendrá un formulario para agregar un nuevo usuario a la base de datos:

```php title="new.php" caption="Formulario para agregar un nuevo usuario" showLineNumbers
<?php include_once 'inc/header.php'; ?>
<h2>Agregar Usuario</h2>

<form action="save.php" method="post">
  <fieldset>
    <label for="name">Nombre:</label>
    <input type="text" name="name" id="name" required>
  </fieldset>
  <fieldset>
    <label for="email">Email:</label>
    <input type="email" name="email" id="email" required>
  </fieldset>
  <fieldset>
    <button type="submit">Guardar</button>
  </fieldset>
</form>

<?php include_once 'inc/footer.php'; ?>
```

Este formulario es relativamente simple, consta de dos campos de texto para el nombre y el email del usuario, y un botón para enviar el formulario.

El formulario envía los datos a un archivo llamado `save.php` mediante el método `POST`, que es donde procesaremos los datos y los guardaremos en la base de datos.

## Guardar un nuevo usuario

Ahora, trabajaremos en el archivo `save.php` en la raíz del proyecto para procesar los datos del formulario y guardar un nuevo usuario en la base de datos:

```php title="save.php" showLineNumbers
<?php
require_once 'inc/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    [$name, $email] = $_POST;

    $stmt = $pdo->prepare('INSERT INTO users (name, email) VALUES (:name, :email)');
    $stmt->execute(['name' => $name, 'email' => $email]);

    header('Location: index.php');
    exit;
}
?>
```

Desglosemos el código:

- En la línea **2** incluímos la conexión a la base de datos, puesto que la utilizaremos.
- En la línea **4** verificamos si el servidor recibió una solicitud de tipo `POST`, de ser así, podemos proceder a procesar el formulario.
- En la línea **5** desestructuramos el array `$_POST` para obtener los valores de los campos `name` y `email` del formulario, es decir, tomamos los valores de los índices `name` y `email` y los asignamos a las variables `$name` y `$email`, respectivamente.
- En la línea **7** preparamos una consulta SQL para insertar un nuevo usuario en la tabla `users`, utilizando marcadores de posición con los nombres de los campos (`:name` y `:email`) para evitar la inyección de SQL.
- En la línea **8** ejecutamos la consulta SQL, pasando un array asociativo con los valores de los campos `name` y `email`.
- Finalmente, en la línea **10** redirigimos al usuario a la página `index.php` después de guardar el nuevo usuario en la base de datos.

### Nota sobre el guardado de datos

Lo primero que debemos tener en cuenta al ejecutar cualquier consulta SQL es la posibilidad de inyección de SQL, por lo que siempre debemos utilizar marcadores de posición en nuestras consultas para evitar este tipo de ataques.

PDO nos permite utilizar marcadores de posición con los nombres de los campos, lo que hace que nuestras consultas sean más seguras y menos propensas a errores.

Adicionalmente, por brevedad del código, se omitió el manejo de excepciones, mismo que debería ser implementado para manejar cualquier error que pueda ocurrir durante la ejecución de la consulta SQL.

## Ver un usuario

Ahora, vamos a trabajar en la funcionalidad para ver un usuario específico, para ello, crearemos un archivo llamado `view.php` en la raíz del proyecto.

Este archivo será relativamente sencillo, ya que sólo mostrará los datos del usuario en modo texto, aunque podríamos mejorar el diseño para hacerlo más atractivo.

```php title="view.php" showLineNumbers
<?php
require_once 'inc/db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    header('Location: index.php');
    exit;
}
// Obtenemos el usuario con el ID proporcionado
$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $id]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header('Location: index.php');
    exit;
}
?>

<?php include_once 'inc/header.php'; ?>

<h2>Detalles del Usuario</h2>
<a href="index.php">&laquo; Volver</a>
<dl>
  <dt>ID:</dt>
  <dd><?= $user['id']; ?></dd>
  <dt>Nombre:</dt>
  <dd><?= $user['name']; ?></dd>
  <dt>Email:</dt>
  <dd><?= $user['email']; ?></dd>
  <dt>Fecha de Creación:</dt>
  <dd><?= $user['created_at']; ?></dd>
</dl>

<?php include_once 'inc/footer.php'; ?>
```

**Nota:** Para este punto, ya deberías tener una idea de cómo funciona el código, por lo que no entraré en detalles sobre cada línea.

Revisemos lo que hicimos en este archivo:

- Primero verificamos si se ha proporcionado un `id` en la URL, si no es así, redirigimos al usuario a la página `index.php`.
- Luego, preparamos una consulta SQL para seleccionar un usuario específico de la tabla `users` utilizando el `id` proporcionado en la URL.
- Si el usuario no existe en la base de datos, redirigimos al usuario a la página `index.php`.
- Finalmente, mostramos los detalles del usuario en una lista de definición (`<dl>`) con los campos `ID`, `Nombre`, `Email` y `Fecha de Creación`.

## Actualizar un usuario

Ahora, vamos a trabajar en la funcionalidad para actualizar un usuario existente, para ello, crearemos un archivo llamado `update.php` en la raíz del proyecto.

Este archivo contendrá un formulario similar al de `new.php`, pero con los datos del usuario que queremos actualizar.

```php title="update.php" showLineNumbers
<?php
require_once 'inc/db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM users WHERE id = :id');
$stmt->execute(['id' => $id]);

$user = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$user) {
    header('Location: index.php');
    exit;
}
?>

<?php include_once 'inc/header.php'; ?>

<h2>Editar Usuario</h2>
<a href="index.php">&laquo; Volver</a>
<form action="save.php" method="post">
  <input type="hidden" name="id" value="<?= $user['id']; ?>"> <!-- Campo oculto para el ID -->
  <fieldset>
    <label for="name">Nombre:</label>
    <input type="text" name="name" id="name" value="<?= $user['name']; ?>" required>
  </fieldset>
  <fieldset>
    <label for="email">Email:</label>
    <input type="email" name="email" id="email" value="<?= $user['email']; ?>" required>
  </fieldset>
  <fieldset>
    <button type="submit">Actualizar</button>
  </fieldset>
</form>

<?php include_once 'inc/footer.php'; ?>
```

Desglosemos el código:

- Primero, verificamos si se ha proporcionado un `id` en la URL, si no es así, redirigimos al usuario a la página `index.php`, my similar a lo que hicimos en `view.php`.
- Luego, preparamos una consulta SQL para seleccionar un usuario específico de la tabla `users` utilizando el `id` proporcionado en la URL.
  - Es importante notar que usamos el método `fetch` en lugar de `fetchAll` para obtener un solo registro.
- Si el usuario no existe en la base de datos, redirigimos al usuario a la página `index.php`.
- Finalmente, mostramos un formulario similar al de `new.php`, pero con los datos del usuario que queremos actualizar, y un campo oculto para el `id` del usuario.

## Guardar la actualización de un usuario

Para completar la funcionalidad de actualización de un usuario, necesitamos modificar el archivo `save.php` para manejar la actualización de los datos del usuario.

```php title="save.php" caption="Actualización para manejo de creación y actualización" showLineNumbers
<?php
require_once 'inc/db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  // Si hay un ID es una actualización
  if (isset($_POST['id'])) {
    [$id, $name, $email] = $_POST;

    $stmt = $pdo->prepare('UPDATE users SET name = :name, email = :email WHERE id = :id');
    $stmt->execute(['id' => $id, 'name' => $name, 'email' => $email]);
  } else {
    [$name, $email] = $_POST;

    $stmt = $pdo->prepare('INSERT INTO users (name, email) VALUES (:name, :email)');
    $stmt->execute(['name' => $name, 'email' => $email]);
  }
}

header('Location: index.php');
exit;
?>
```

Con el código anterior, hemos modificado la lógica para manejar tanto la creación de un nuevo usuario como la actualización de un usuario existente, dependiendo de si se proporciona un `id` en el formulario.

Con esto se reutiliza el mismo archivo `save.php` para manejar ambas operaciones, lo que simplifica el código y evita la duplicación de lógica.

## Eliminar un usuario

Finalmente, vamos a trabajar en la funcionalidad para eliminar un usuario de la base de datos, para ello, usaremos el archivo llamado `delete.php` en la raíz del proyecto.

```php title="delete.php" showLineNumbers
<?php
require_once 'inc/db.php';

$id = $_GET['id'] ?? null;

if (!$id) {
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = :id');
$stmt->execute(['id' => $id]);

header('Location: index.php');
exit;
?>
```

Veamos el código:

- En este archivo, verificamos si se ha proporcionado un `id` en la URL, si no es así, redirigimos al usuario a la página `index.php`.
  - Aunque hemos hecho esta validación en otros archivos, aquí es **extremadamente** importante, puesto que involucra una operación irreversible.
- Luego, preparamos una consulta SQL para eliminar un usuario específico de la tabla `users` utilizando el `id` proporcionado en la URL.
- Finalmente, redirigimos al usuario a la página `index.php` después de eliminar el usuario de la base de datos.

## _Et voilà!_

Con esto hemos completado la implementación de un CRUD básico en PHP, utilizando MySQL como sistema de gestión de bases de datos.

En este tutorial revisamos los conceptos básicos de un CRUD, desde la creación de una base de datos, la conexión a la base de datos, la creación de un nuevo usuario, la visualización de un usuario, la actualización de un usuario y la eliminación de un usuario.

Al utilizar PDO, la conexión a la base de datos y la gestión de la información, se vuelve muy sencilla e intuitiva.

Cabe mencionar que este es un CRUD muy básico y que se puede mejorar y extender de muchas maneras, como agregar validaciones de datos, paginación, búsqueda, filtros, etc.

Adicionalmente, se podría agregar un sistema de autenticación para proteger las operaciones CRUD y permitir que sólo los usuarios autenticados puedan acceder a ellas, pero eso ya es tema para otra guía. 😉
