package uk.gov.justice.laa.cwa.bulkupload.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.client.RestClient;

@Profile("!test")
@Configuration
public class RestClientConfig {

    @Value("${sds-api.url}")
    private String sdsApiUrl;

    @Bean
    public RestClient restClient() {
        return RestClient.builder()
                .baseUrl(sdsApiUrl)
                .build();
    }
}