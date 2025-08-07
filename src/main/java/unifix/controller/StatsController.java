package unifix.controller;

import io.javalin.Javalin;
import io.javalin.http.Context;
import unifix.dao.ReportDAO;
import unifix.dao.ProblemDAO;
import unifix.dao.HistoryDAO;
import java.util.Map;
import java.util.List;
import unifix.model.Problem;
import unifix.model.History;

public class StatsController {
    public static void register(Javalin app) {
        app.get("/api/stats/category", StatsController::byCategory);
        app.get("/api/stats/status", StatsController::byStatus);

        app.get("/api/stats/problems", StatsController::problemStats);
    }

    private static void byCategory(Context ctx) {
        Map<String, Integer> data = ReportDAO.countByCategory();
        ctx.json(data);
    }

    private static void byStatus(Context ctx) {
        Map<String, Integer> data = ReportDAO.countByStatus();
        ctx.json(data);
    }

    // Nuevos métodos

    /**
     * Obtiene estadísticas de tipos de problemas
     * Ejemplo de respuesta:
     * [
     *   {"type": "Fuga de agua", "severity": "Alto"},
     *   {"type": "Aire acondicionado", "severity": "Medio"}
     * ]
     */
    private static void problemStats(Context ctx) {
        List<Problem> problems = ProblemDAO.getAll();
        ctx.json(problems);
    }

    /**
     * Obtiene el historial de un reporte específico
     * Ejemplo de respuesta para GET /api/reports/123/history:
     * [
     *   {"comment": "Se asignó a técnico", "responseDate": "2023-10-25 14:30:00"},
     *   {"comment": "Resuelto", "responseDate": "2023-10-26 10:15:00"}
     * ]
     */
    private static void reportHistory(Context ctx) {
        int reportId = Integer.parseInt(ctx.pathParam("id"));
        List<History> history = ReportDAO.getHistory(reportId);
        ctx.json(history);
    }
}