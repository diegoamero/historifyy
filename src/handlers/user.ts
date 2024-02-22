import { Request, Response } from "express"
import { invalidBody, unknownServerError } from "./common.js"
import { db } from "../context.js";
import { User } from "../types.js";

export async function loginForm(req: Request, res: Response): Promise<void> {
    let isRetrying: boolean = (req as any).id === "true";
    console.log("in login form with failed login: " + isRetrying);

    res.send(`
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <title></title>
            <meta name="description" content="">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <link rel="stylesheet" href="../login.css" type="text/css">
        </head>
        <body>
            <form action="/" method="post">
                <h2 class="title">BIENVENIDO</h2>
                <div>${isRetrying ? "failed login" : ""}</div>
                <div class="input--container">
                    <label class="input--label" for="user">Usuario:</label>
                    <input type="text" id="user" name="username"/>
                </div>
                <div class="input--container">
                    <label class="input--label"  for="password">Contraseña:</label>
                    <input type="password" id="password" name="password"/>
                </div>
                <input class="submit--btn" type="submit" value="Ingresar">
            </form>
        </body>
    </html>
    `);
}

export async function logUser(req: Request, res: Response): Promise<void> {
    if (!isValidLogObject(req.body)) return invalidBody(res);

    let user: User;
    try {
        user = await db.selectFrom("users")
            .selectAll()
            .where("username", "=", req.body.username)
            .executeTakeFirstOrThrow();
    } catch (err) {
        // user no existe, probablemente
        return unknownServerError(res, err);
    }

    if (req.body.password === user.passw) {
        res.redirect('/dashboard');
    } else {
        res.redirect('/true');
    }
}

function isValidLogObject(obj: any): obj is { username: string; password: string } {
    return typeof obj.username == "string"
        && typeof obj.password == "string";
}