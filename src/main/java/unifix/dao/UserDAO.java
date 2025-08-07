package unifix.dao;

import unifix.db.DatabaseConnection;
import unifix.model.User;
import java.sql.*;

public class UserDAO {
    public static boolean register(User user) {
        try (Connection con = DatabaseConnection.getConnection()) {
            PreparedStatement ps = con.prepareStatement("INSERT INTO users(name, lastname, email, matricula, password, type) VALUES (?, ?, ?, ?, ?, ?)");
            ps.setString(1, user.name);
            ps.setString(2, user.lastname);
            ps.setString(3, user.email);
            ps.setString(4, user.matricula);
            ps.setString(5, user.password);
            ps.setString(6, user.type);
            return ps.executeUpdate() == 1;
        } catch (Exception e) {
            return false;
        }
    }

    public static User login(User user) {
        try (Connection con = DatabaseConnection.getConnection()) {
            PreparedStatement ps = con.prepareStatement("SELECT * FROM users WHERE email=? AND password=? AND type=?");
            ps.setString(1, user.email);
            ps.setString(2, user.password);
            ps.setString(3, user.type);
            ResultSet rs = ps.executeQuery();
            if (rs.next()) {
                User u = new User();
                u.id = rs.getInt("id");
                u.name = rs.getString("name");
                u.lastname = rs.getString("lastname");
                u.email = rs.getString("email");
                u.matricula = rs.getString("matricula");
                u.type = rs.getString("type");
                return u;
            }
        } catch (Exception ignored) {}
        return null;
    }
}