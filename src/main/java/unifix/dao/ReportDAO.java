package unifix.dao;

import unifix.db.DatabaseConnection;
import unifix.model.Report;
import unifix.model.History;
import java.sql.*;
import java.util.*;

public class ReportDAO {
    // Crear reporte (ahora con userId como int)
    public static boolean create(Report r) {
        String sql = "INSERT INTO reports(name, user_id, date, location, category, building, description, status) " +
                "VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, r.name);
            ps.setInt(2, r.userId);  // Cambiado a userId (int)
            ps.setString(3, r.date);
            ps.setString(4, r.location);
            ps.setString(5, r.category);
            ps.setString(6, r.building);
            ps.setString(7, r.description);
            ps.setString(8, r.status);
            return ps.executeUpdate() == 1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Obtener todos los reportes con JOIN para nombre de usuario
    public static List<Report> getAll() {
        List<Report> list = new ArrayList<>();
        String sql = "SELECT r.*, u.name AS user_name FROM reports r JOIN users u ON r.user_id = u.id";
        try (Connection con = DatabaseConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {
            while (rs.next()) {
                Report r = new Report();
                r.id = rs.getInt("id");
                r.name = rs.getString("name");
                r.userId = rs.getInt("user_id");
                r.user = rs.getString("user_name");
                r.date = rs.getString("date");
                r.location = rs.getString("location");
                r.category = rs.getString("category");
                r.building = rs.getString("building");
                r.description = rs.getString("description");
                r.status = rs.getString("status");
                list.add(r);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }

    // Método nuevo para obtener un reporte por ID
    public static Report getById(int id) {
        String sql = "SELECT r.*, u.name AS user_name FROM reports r JOIN users u ON r.user_id = u.id WHERE r.id = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, id);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                Report r = new Report();
                r.id = rs.getInt("id");
                r.name = rs.getString("name");
                r.userId = rs.getInt("user_id");
                r.user = rs.getString("user_name");
                r.date = rs.getString("date");
                r.location = rs.getString("location");
                r.category = rs.getString("category");
                r.building = rs.getString("building");
                r.description = rs.getString("description");
                r.status = rs.getString("status");
                return r;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    // Actualizar estado de reporte
    public static boolean updateStatus(int id, String status) {
        String sql = "UPDATE reports SET status = ? WHERE id = ?";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setString(1, status);
            ps.setInt(2, id);
            return ps.executeUpdate() == 1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Métodos estadísticos
    public static Map<String, Integer> countByCategory() {
        Map<String, Integer> map = new HashMap<>();
        String sql = "SELECT category, COUNT(*) as total FROM reports GROUP BY category";
        try (Connection con = DatabaseConnection.getConnection();
             ResultSet rs = con.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                map.put(rs.getString("category"), rs.getInt("total"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }

    public static Map<String, Integer> countByStatus() {
        Map<String, Integer> map = new HashMap<>();
        String sql = "SELECT status, COUNT(*) as total FROM reports GROUP BY status";
        try (Connection con = DatabaseConnection.getConnection();
             ResultSet rs = con.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                map.put(rs.getString("status"), rs.getInt("total"));
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return map;
    }

    // Nuevo método para añadir historial
    public static boolean addHistory(History history) {
        String sql = "INSERT INTO history(report_id, comment) VALUES (?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, history.reportId);
            ps.setString(2, history.comment);
            return ps.executeUpdate() == 1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // Nuevo método para obtener historial por reporte
    public static List<History> getHistory(int reportId) {
        List<History> history = new ArrayList<>();
        String sql = "SELECT * FROM history WHERE report_id = ? ORDER BY response_date DESC";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, reportId);
            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                History h = new History();
                h.id = rs.getInt("id");
                h.reportId = rs.getInt("report_id");
                h.comment = rs.getString("comment");
                h.responseDate = rs.getString("response_date");
                history.add(h);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return history;
    }
}