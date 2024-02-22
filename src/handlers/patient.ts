import { Request, Response } from "express"
import { db } from "../context.js";
import { isNewPatient, isPatientUpdate } from "../validation/patient.js";
import { invalidBody, unknownServerError } from "./common.js";
import { Patient } from "../types.js";

export async function getOnePatient(req: Request, res: Response): Promise<void> {
    try {
        const result = await db.selectFrom('patients')
            .selectAll()
            .where('id_document', '=', (req as any).id)
            .executeTakeFirstOrThrow();

        res.status(200).send("Found patient " + result.fname + " with ID document " + result.id_document);
    } catch (err) {
        return unknownServerError(res, err);
    }
}

export async function searchPatientForm(_: Request, res: Response): Promise<void> {
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

            let searchText = document.getElementById("id_document").value.trim();
            let form = document.getElementById("form");
    
            if(searchText.length > 0) {
                form.action = "/patient/update/" + searchText;
                form.submit();
            } else {
                return false;
            }
        }
    </script>
    <body>
        <h2 class="pg--title">Actualizar Paciente</h2>
        <form class="form" id="form" action="" method="get" onsubmit="return submitFunction();">
        <div class="input--box">
            <label class="form--label" for="id_document" required >Cédula</label>
            <input class="form--input" type="text" id="id_document" required >
        </div>    
            <input class="submit--btn" type="submit" value="Buscar" required >
        </form>
    </body>
    </html>
    `);
}

export async function createPatientForm(_: Request, res: Response): Promise<void> {
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
        <h2 class="pg--title">Paciente</h2>
        <form class="form" action="" method="post">
            <h3 class="form--title">Ingrese los datos del paciente</h3>
            <div class="input--box"> 
                <label class="form--label" for="id_document">Cédula</label>
                <input  required class="form--input" type="text" name="id_document" id="id_document">
            </div>
            <div class="input--box"> 
                <label class="form--label" for="gender">Género</label>
                <select required  name="gender" id="gender" class="form--input">
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="X">Otro</option>
                </select>
            </div>
            <div class="input--box"> 
                <label class="form--label" for="birth">Fecha de nacimiento</label>
                <input  required class="form--input" type="date" name="birth" id="birth">
            </div>
            <div class="input--box"> 
                <label class="form--label" for="fname">Nombres</label>
                <input  required class="form--input" type="text" name="fname" id="fname">
            </div>
            <div class="input--box"> 
                <label class="form--label" for="lname">Apellidos</label>
                <input required  class="form--input" type="text" name="lname" id="lname">
            </div>
            <div class="input--box"> 
                <label class="form--label" for="phone">Teléfono</label>
                <input required  class="form--input" type="tel" name="phone" id="phone">
            </div>
            <div class="input--box"> 
                <label class="form--label" for="area">Localidad</label>
                <select  required name="area" id="area" class="form--input">
                    <option value="BAR">Barcelona</option>
                    <option value="PLC">Puerto La Cruz</option>
                    <option value="LEC">Lechería</option>
                </select>
            </div>
            <div class="input--box"> 
                <label class="form--label" for="patient_desc">Descripción</label>
                <input  required class="form--input" type="text" name="patient_desc" id="patient_desc">
            </div>
            <input  required class="submit--btn" type="submit" value="Enviar">
        </form>
    </body>
    </html>
    `);
}

export async function createPatient(req: Request, res: Response): Promise<void> {
    if (!isNewPatient(req.body)) return invalidBody(res);
    try {
        const result = await db.insertInto('patients')
            .values(req.body)
            .executeTakeFirstOrThrow();
        
        res.status(201).send("Created patient " + req.body.fname + " with ID " + result.insertId);
    } catch (err) {
        return unknownServerError(res, err);
    }
}

export async function updatePatientForm(req: Request, res: Response): Promise<void> {
    const id_document: string = (req as any).id;
    let result: Patient;
    try {
        result = await db.selectFrom("patients")
            .selectAll()
            .where("id_document", "=", id_document)
            .executeTakeFirstOrThrow();
    } catch (err) {
        return unknownServerError(res, err);
    }

    const birth_string = result.birth.getFullYear() + "-" 
                       + (result.birth.getMonth() + 1) + "-" 
                       + result.birth.getDate();
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
        <h2 class="pg--title">Paciente</h2>
        <form action="" method="post" class="form">
            <input type="hidden" name="id" value="${result.id}" />
            <h3 class="form--title">Ingrese los datos del paciente</h3>
            <div class="input--box">
                <label for="id_document" class="form--label">Cédula</label>
                <input type="text" name="id_document" id="id_document" class="form--input" value="${result.id_document}">
            </div>
    
            <div class="input--box">
            <label for="gender" class="form--label">Género</label>
            <select name="gender" id="gender" class="form--input">
                <option value="M" ${result.gender === "M" ? "selected" : ""}>Masculino</option>
                <option value="F" ${result.gender === "F" ? "selected" : ""}>Femenino</option>
                <option value="X" ${result.gender === "X" ? "selected" : ""}>Otro</option>
            </select>
            </div>
    
            <div class="input--box">
            <label for="birth" class="form--label">Fecha de nacimiento</label>
            <input type="date" name="birth" id="birth" value="${birth_string}" class="form--input">
            </div>
    
            <div class="input--box">
            <label for="fname" class="form--label">Nombres</label>
            <input type="text" name="fname" id="fname" value="${result.fname}" class="form--input">
            </div>
    
            <div class="input--box">
            <label for="lname" class="form--label">Apellidos</label>
            <input type="text" name="lname" id="lname" value="${result.lname}" class="form--input">
            </div>
    
            <div class="input--box">
            <label for="phone" class="form--label">Teléfono</label>
            <input type="tel" name="phone" id="phone" value="${result.phone}" class="form--input">
            </div>
    
            <div class="input--box">
            <label for="area" class="form--label">Localidad</label>
            <select name="area" id="area" class="form--input">
                <option value="BAR" ${result.area === "BAR" ? "selected" : ""}>Barcelona</option>
                <option value="PLC" ${result.area === "PLC" ? "selected" : ""}>Puerto La Cruz</option>
                <option value="LEC" ${result.area === "LEC" ? "selected" : ""}>Lechería</option>
            </select>
            </div>
    
            <div class="input--box">
            <label for="patient_desc" class="form--label">Descripción</label>
            <input type="text" name="patient_desc" id="patient_desc" value="${result.patient_desc}" class="form--input">
            </div>
    
            <hr/><br/>
            
            <input type="submit" value="Actualizar" class="submit--btn" formaction="/patient/update/" />
        </form>
    </body>
    </html>
    `);
}

export async function updatePatient(req: Request, res: Response): Promise<void> {
    if (!isPatientUpdate(req.body)) return invalidBody(res);
    try {
        const result = await db.updateTable('patients')
            .set({ ...req.body })
            .executeTakeFirstOrThrow();
        
        res.status(200).send("Updated patient " + req.body.fname + ", changed " + result.numUpdatedRows + " rows.");
    } catch (err) {
        return unknownServerError(res, err);
    }
}