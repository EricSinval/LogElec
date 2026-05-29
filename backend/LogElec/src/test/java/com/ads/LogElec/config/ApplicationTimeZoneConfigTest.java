package com.ads.LogElec.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.TimeZone;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ApplicationTimeZoneConfigTest {

    private TimeZone originalTimeZone;
    private String originalUserTimeZone;

    @BeforeEach
    void setUp() {
        originalTimeZone = TimeZone.getDefault();
        originalUserTimeZone = System.getProperty("user.timezone");
    }

    @AfterEach
    void tearDown() {
        TimeZone.setDefault(originalTimeZone);

        if (originalUserTimeZone == null) {
            System.clearProperty("user.timezone");
            return;
        }

        System.setProperty("user.timezone", originalUserTimeZone);
    }

    @Test
    void applyDefineTimeZonePadraoDaAplicacao() {
        ApplicationTimeZoneConfig config = new ApplicationTimeZoneConfig("America/Sao_Paulo");

        config.apply();

        assertThat(TimeZone.getDefault().getID()).isEqualTo("America/Sao_Paulo");
        assertThat(System.getProperty("user.timezone")).isEqualTo("America/Sao_Paulo");
    }
}