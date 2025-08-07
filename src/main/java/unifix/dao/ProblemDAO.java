package unifix.dao;

import unifix.model.Problem;
import unifix.db.DatabaseConnection;
import java.sql.*;
import java.util.*;

public class ProblemDAO {
    public static List<Problem> getAll() {
        List<Problem> list = new ArrayList<>();
        String sql = "SELECT * FROM problems";

        try (Connection con = DatabaseConnection.getConnection();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                Problem p = new Problem();
                p.id = rs.getInt("id");
                p.type = rs.getString("type");
                p.severity = rs.getString("severity");
                list.add(p);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return list;
    }
}