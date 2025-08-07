package unifix.dao;

import unifix.db.DatabaseConnection;
import unifix.model.History;
import java.sql.*;

public class HistoryDAO {
    public static boolean addComment(History h) {
        String sql = "INSERT INTO history(report_id, comment) VALUES (?, ?)";
        try (Connection con = DatabaseConnection.getConnection();
             PreparedStatement ps = con.prepareStatement(sql)) {
            ps.setInt(1, h.reportId);
            ps.setString(2, h.comment);
            return ps.executeUpdate() == 1;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}