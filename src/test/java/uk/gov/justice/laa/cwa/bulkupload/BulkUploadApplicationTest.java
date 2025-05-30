package uk.gov.justice.laa.cwa.bulkupload;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
class BulkUploadApplicationTest {

    // Disable spring security
    @TestConfiguration
    public static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.authorizeHttpRequests(/**/authorize -> authorize
                    .anyRequest().permitAll());
            return http.build();
        }

    }

    @Test
    void contextLoads() {
        // empty due to only testing context load
    }
}