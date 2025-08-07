package unifix;

import io.javalin.Javalin;
import io.javalin.plugin.bundled.CorsPluginConfig;
import unifix.controller.AuthController;
import unifix.controller.ReportController;
import unifix.controller.StatsController;


public class Main {
    public static void main(String[] args) {
        Javalin app = Javalin.create(config -> config.plugins.enableCors(cors -> cors.add(CorsPluginConfig::anyHost))).start(7070);

        AuthController.register(app);
        ReportController.register(app);
        StatsController.register(app);
    }
}