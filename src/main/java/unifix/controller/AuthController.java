package unifix.controller;

import io.javalin.Javalin;
import io.javalin.http.Context;
import unifix.dao.UserDAO;
import unifix.model.User;
import java.util.Map;
import java.util.logging.Logger;

public class AuthController {
    private static final Logger logger = Logger.getLogger(AuthController.class.getName());

    public static void register(Javalin app) {
        app.post("/api/auth/register", AuthController::registerUser);
        app.post("/api/auth/login", AuthController::login);
    }

    private static void registerUser(Context ctx) {
        try {
            logger.info("Iniciando proceso de registro de usuario");

            User user = ctx.bodyAsClass(User.class);

            // Validaciones de entrada
            if (isNullOrEmpty(user.name)) {
                ctx.status(400).json(Map.of("error", "El nombre es requerido"));
                return;
            }
            if (isNullOrEmpty(user.email)) {
                ctx.status(400).json(Map.of("error", "El email es requerido"));
                return;
            }
            if (isNullOrEmpty(user.password)) {
                ctx.status(400).json(Map.of("error", "La contraseña es requerida"));
                return;
            }
            if (isNullOrEmpty(user.type)) {
                ctx.status(400).json(Map.of("error", "El tipo de usuario es requerido"));
                return;
            }

            logger.info(String.format("Procesando registro: %s - %s - Tipo: %s",
                    user.name, user.email, user.type));

            boolean success = UserDAO.register(user);

            if (success) {
                logger.info("Usuario registrado exitosamente");
                ctx.status(201).json(Map.of(
                        "message", "Registro exitoso",
                        "success", true
                ));
            } else {
                logger.warning("Fallo en el registro de usuario");
                ctx.status(400).json(Map.of(
                        "error", "Error en el registro - verifique los datos",
                        "success", false
                ));
            }
        } catch (Exception e) {
            logger.severe("Error durante el registro: " + e.getMessage());
            ctx.status(500).json(Map.of(
                    "error", "Error interno del servidor: " + e.getMessage(),
                    "success", false
            ));
        }
    }

    private static void login(Context ctx) {
        try {
            logger.info("Iniciando proceso de autenticación");

            User user = ctx.bodyAsClass(User.class);
            User found = UserDAO.login(user);

            if (found != null) {
                logger.info("Autenticación exitosa para: " + found.email);
                ctx.status(200).json(Map.of(
                        "id", found.id,
                        "name", found.name,
                        "lastname", found.lastname,
                        "email", found.email,
                        "matricula", found.matricula,
                        "type", found.type,
                        "success", true
                ));
            } else {
                logger.warning("Intento de autenticación fallido para: " + user.email);
                ctx.status(401).json(Map.of(
                        "error", "Credenciales inválidas",
                        "success", false
                ));
            }
        } catch (Exception e) {
            logger.severe("Error durante la autenticación: " + e.getMessage());
            ctx.status(500).json(Map.of(
                    "error", "Error interno del servidor",
                    "success", false
            ));
        }
    }

    private static boolean isNullOrEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }
}