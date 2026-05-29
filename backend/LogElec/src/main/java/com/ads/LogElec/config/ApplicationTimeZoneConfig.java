package com.ads.LogElec.config;

import jakarta.annotation.PostConstruct;
import java.time.ZoneId;
import java.util.TimeZone;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ApplicationTimeZoneConfig {

    private final String timeZoneId;

    public ApplicationTimeZoneConfig(@Value("${app.timezone:America/Sao_Paulo}") String timeZoneId) {
        this.timeZoneId = timeZoneId;
    }

    @PostConstruct
    void apply() {
        ZoneId zoneId = ZoneId.of(timeZoneId);
        TimeZone timeZone = TimeZone.getTimeZone(zoneId);

        TimeZone.setDefault(timeZone);
        System.setProperty("user.timezone", zoneId.getId());
    }
}