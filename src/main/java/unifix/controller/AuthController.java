package unifix.controller;

import io.javalin.Javalin;
import io.javalin.http.Context;
import unifix.dao.UserDAO;
import unifix.model.User;

public class AuthController {
    public static void register(Javalin app) {
        app.post("/api/auth/register", AuthController::registerUser);
        app.post("/api/login", AuthController::login);
    }

    private static void registerUser(Context ctx) {
        User user = ctx.bodyAsClass(User.class);
        boolean success = UserDAO.register(user);
        if (success) {
            ctx.status(201).json("Registro exitoso");
        } else {
            ctx.status(400).json("Error en el registro");
        }
    }

    private static void login(Context ctx) {
        User user = ctx.bodyAsClass(User.class);
        User found = UserDAO.login(user);
        if (found != null) {
            ctx.status(200).json(found);
        } else {
            ctx.status(401).json("Credenciales inválidas");
        }
    }
}