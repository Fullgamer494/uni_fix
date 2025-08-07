package unifix.controller;

import io.javalin.Javalin;
import io.javalin.http.Context;
import unifix.dao.ReportDAO;
import unifix.dao.HistoryDAO;
import unifix.model.Report;
import unifix.model.History;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

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
                ctx.status(201).json(createSuccessResponse("Reporte creado exitosamente", report));
            } else {
                ctx.status(400).json(createErrorResponse("No se pudo crear el reporte"));
            }
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error interno: " + e.getMessage()));
        }
    }

    private static void getAllReports(Context ctx) {
        try {
            List<Report> reports = ReportDAO.getAll();

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Reportes obtenidos exitosamente");
            response.put("data", reports);
            response.put("count", reports.size());

            ctx.json(response);
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error al obtener reportes: " + e.getMessage()));
        }
    }

    private static void getReportById(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            Report report = ReportDAO.getById(id);

            if (report != null) {
                ctx.json(createSuccessResponse("Reporte encontrado", report));
            } else {
                ctx.status(404).json(createErrorResponse("Reporte no encontrado"));
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json(createErrorResponse("ID inválido"));
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error al buscar reporte: " + e.getMessage()));
        }
    }

    private static void updateReportStatus(Context ctx) {
        try {
            int id = Integer.parseInt(ctx.pathParam("id"));
            String status = ctx.queryParam("status");

            if (status == null || status.isEmpty()) {
                ctx.status(400).json(createErrorResponse("El parámetro 'status' es requerido"));
                return;
            }

            boolean updated = ReportDAO.updateStatus(id, status);

            if (updated) {
                Map<String, Object> data = new HashMap<>();
                data.put("id", id);
                data.put("status", status);
                ctx.status(200).json(createSuccessResponse("Estado actualizado exitosamente", data));
            } else {
                ctx.status(404).json(createErrorResponse("Reporte no encontrado o no se pudo actualizar"));
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json(createErrorResponse("ID inválido"));
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error al actualizar estado: " + e.getMessage()));
        }
    }

    private static void addHistoryEntry(Context ctx) {
        try {
            int reportId = Integer.parseInt(ctx.pathParam("id"));
            History history = ctx.bodyAsClass(History.class);
            history.reportId = reportId; // Asegurar consistencia

            boolean success = HistoryDAO.addComment(history);

            if (success) {
                ctx.status(201).json(createSuccessResponse("Entrada de historial agregada exitosamente", history));
            } else {
                ctx.status(400).json(createErrorResponse("No se pudo agregar la entrada de historial"));
            }
        } catch (NumberFormatException e) {
            ctx.status(400).json(createErrorResponse("ID de reporte inválido"));
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error al agregar historial: " + e.getMessage()));
        }
    }

    private static void getReportHistory(Context ctx) {
        try {
            int reportId = Integer.parseInt(ctx.pathParam("id"));
            List<History> history = ReportDAO.getHistory(reportId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Historial obtenido exitosamente");
            response.put("data", history);
            response.put("reportId", reportId);
            response.put("count", history.size());

            ctx.json(response);
        } catch (NumberFormatException e) {
            ctx.status(400).json(createErrorResponse("ID de reporte inválido"));
        } catch (Exception e) {
            ctx.status(500).json(createErrorResponse("Error al obtener historial: " + e.getMessage()));
        }
    }

    // Métodos auxiliares para crear respuestas consistentes
    private static Map<String, Object> createSuccessResponse(String message, Object data) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("data", data);
        return response;
    }

    private static Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        response.put("data", null);
        return response;
    }
}