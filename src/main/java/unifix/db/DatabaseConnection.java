package unifix.db;

import java.sql.Connection;
import java.sql.DriverManager;

public class DatabaseConnection {
    public static Connection getConnection() throws Exception {
        String url = "jdbc:mysql://localhost:3306/unifix";
        String user = "root";
        String password = "qwerty123";
        Class.forName("com.mysql.cj.jdbc.Driver");
        return DriverManager.getConnection(url, user, password);
    }
}