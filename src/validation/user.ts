import { NewUser } from "../types.js";

export function isNewUser(obj: any): obj is NewUser {
    return typeof obj.username == "string"
        && typeof obj.pssw == "string"
        && typeof obj.is_root == "boolean";
}


//Esto no supe adaptarlo, qué habría qué hacer en este caso
export function isUserUpdate(obj: any) {

}