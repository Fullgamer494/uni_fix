package unifix.controller;

import io.javalin.Javalin;
import io.javalin.http.Context;
import unifix.dao.ReportDAO;
import unifix.dao.HistoryDAO;
import unifix.model.Report;
import unifix.model.History;
import java.util.List;

public class ReportController {
    public static void register(Javalin app) {
        // Endpoints básicos de reportes
        app.post("/api/reports", ReportController::createReport);
        app.get("/api/reports", ReportController::getAllReports);
        app.get("/api/reports/{id}", ReportController::getReportById);
        app.put("/api/reports/{id}/status", ReportController::updateReportStatus);

        // Gestión de historial
        app.post("/api/reports/{id}/history", ReportController::addHistoryEntry);
        app.get("/api/reports/{id}/history", ReportController::getReportHistory);
    }

    private static void createReport(Context ctx) {
        try {
            Report report = ctx.bodyAsClass(Report.class);
            boolean success = ReportDAO.create(report);

            if (success) {
                ctx.status(201).json(report);
            } else {
                ctx.status(400).json("Error: No se pudo crear el reporte");
            }
        } catch (Exception e) {
            ctx.status(500).json("Error interno: " + e.getMessage());
        }
    }

    private static void getAllReports(Context ctx) {
        try {
            List<Report> reports = ReportDAO.getAll();
            ctx.json(reports);
        } catch (Exception e) {
            ctx.status(500).json("Error al obtener reportes: " + e.getMessage());
        }
    }

    private static void getReportById(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Report report = ReportDAO.getById(id);

            if (report != null) {
                ctx.json(report);
            } else {
                ctx.status(404).json("Reporte no encontrado");
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json("ID inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al buscar reporte");
        }
    }

    private static void updateReportStatus(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String status = ctx.queryParam("status");

            if (status == null || status.isEmpty()) {
                ctx.status(400).json("El parámetro 'status' es requerido");
                return;
            }

            boolean updated = ReportDAO.updateStatus(id, status);
            ctx.status(updated ? 200 : 404);
        } catch (NumberFormatException e) {
            ctx.status(400).json("ID inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al actualizar estado");
        }
    }

    private static void addHistoryEntry(Context ctx) {
        try {
            int reportId = Integer.parseInt(ctx.pathParam("id"));
            History history = ctx.bodyAsClass(History.class);
            history.reportId = reportId; // Asegurar consistencia

            boolean success = HistoryDAO.addComment(history);
            ctx.status(success ? 201 : 400);
        } catch (NumberFormatException e) {
            ctx.status(400).json("ID de reporte inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al agregar historial");
        }
    }

    private static void getReportHistory(Context ctx) {
        try {
            int reportId = Integer.parseInt(ctx.pathParam("id"));
            List<History> history = ReportDAO.getHistory(reportId);
            ctx.json(history);
        } catch (NumberFormatException e) {
            ctx.status(400).json("ID de reporte inválido");
        } catch (Exception e) {
            ctx.status(500).json("Error al obtener historial");
        }
    }
}