import { Request, Response } from "express"
import { db } from "../context.js";
import { isNewUser, isUserUpdate } from "../validation/User.js";
import { invalidBody, unknownServerError } from "./common.js";
import { User } from "../types.js";

export async function searchUserForm(_: Request, res: Response): Promise<void> {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historify - Control de historial clínico</title>
        <link rel="stylesheet" href="../globals.css" type="text/css">
    </head>
    <script>
        function submitFunction() {
    
            let searchText = document.getElementById("username").value.trim();
            let form = document.getElementById("form");
      
            if(searchText.length > 0) {
                form.action = "/User/update/" + searchText;
                form.submit();
            } else {
                return false;
            }
        }
    </script>
    <body>
        <h2 class="pg--title">Actualizar Usuario</h2>
        <form class="form" id="form" action="" method="get" onsubmit="return submitFunction();">
        <div class="input--box">     
            <label class="form--label" for="username">Nombre de usuario</label>
            <input class="form--input" type="text" id="username">
        </div>
            <input class="submit--btn" type="submit" value="Buscar">
        </form>
    </body>
    </html>
    `);
}

export async function createUserForm(_: Request, res: Response): Promise<void> {
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historify - Control de historial clínico</title>
        <link rel="stylesheet" href="../globals.css" type="text/css">
    </head>
    <body>
        <h2 class="pg--title">Usuario</h2>
        <form class="form" action="" method="post">
            <p class="form--title">Ingrese los datos del usuario:</p>
            <div class="input--box">
                <label class="form--label" for="username">Nombre de usuario</label>
                <input class="form--input" type="text" name="username" id="username">
            </div>
            <div class="input--box">
                <label class="form--label" for="password">Contraseña</label>
                <input class="form--input" type="password" name="password" id="password">
            </div>
            
            <input class="submit--btn" type="submit" value="Enviar">
        </form>
    </body>
    </html>
    `);
}

export async function createUser(req: Request, res: Response): Promise<void> {
    if (!isNewUser(req.body)) return invalidBody(res);
    try {
        const result = await db.insertInto('users')
            .values(req.body)
            .executeTakeFirstOrThrow();
        
        res.status(201).send("Created User " + req.body.fname + " with ID " + result.insertId);
    } catch (err) {
        return unknownServerError(res, err);
    }
}

export async function updateUserForm(req: Request, res: Response): Promise<void> {
    const username: string = (req as any).id;
    let result: User;
    try {
        result = await db.selectFrom('users')
            .selectAll()
            .where("username", "=", username)
            .executeTakeFirstOrThrow();
    } catch (err) {
        return unknownServerError(res, err);
    }
    const birth_string = result.birth.getFullYear() + "-" + (result.birth.getMonth() + 1) + "-" + result.birth.getDate();
    
    //Falta hacer el formulario de abajo
    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Historify - Control de historial clínico</title>
        <link rel="stylesheet" href="../../globals.css" type="text/css">
    </head>
    <body>
        <h2 class="pg--title">Doctor</h2>
        <form class="form" action="" method="post">
            <input type="hidden" name="id" value="${result.id}" />
            <p class="form--title">Ingrese los datos del doctor:</p>
    
            <div class="input--box">
                <label for="username" class="form--label">Matrícula</label>
                <input type="text" name="username" class="form--input" id="username" value="${result.username}">
            </div>
            
            <div class="input--box">
                <label for="gender" class="form--label">Género</label>
            <select name="gender" class="form--input" id="gender">
                <option value="M" ${result.gender === "M" ? "selected" : ""}>Hombre</option>
                <option value="F" ${result.gender === "F" ? "selected" : ""}>Mujer</option>
                <option value="X" ${result.gender === "X" ? "selected" : ""}>Otro</option>
            </select>
            </div>
            
            <div class="input--box">
                <label for="birth" class="form--label">Fecha de nacimiento</label>
                <input type="date" name="birth" class="form--input" id="birth" value="${birth_string}">
            </div>
            
            <div class="input--box">
                <label for="fname" class="form--label">Nombre</label>
            <input type="text" name="fname" class="form--input" id="fname" value="${result.fname}">
            </div>
            
            <div class="input--box">
                <label for="lname" class="form--label">Apellido</label>
                <input type="text" name="lname" class="form--input" id="lname" value="${result.lname}">
            </div>
    
            <div class="input--box">
                <label for="specialty" class="form--label">Especialidad</label>
                <input type="text" name="specialty" class="form--input" id="specialty" value="${result.specialty}">
            </div>
    
            <hr/><br/>
            <input type="submit" value="Actualizar" formaction="/User/update" class="submit--btn" />
        </form>
    </body>
    </html>
    `);
}

export async function updateUser(req: Request, res: Response): Promise<void> {
    if (!isUserUpdate(req.body)) return invalidBody(res);
    try {
        const result = await db.updateTable('Users')
            .set({ ...req.body })
            .executeTakeFirstOrThrow();

        res.status(200).send("Updated User " + req.body.fname + ", changed " + result.numChangedRows + " rows.");
    } catch (err) {
        return unknownServerError(res, err);
    }
}