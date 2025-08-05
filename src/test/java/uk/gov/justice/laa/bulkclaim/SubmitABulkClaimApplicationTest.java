package uk.gov.justice.laa.bulkclaim;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
class SubmitABulkClaimApplicationTest {

  @MockitoBean private OAuth2AuthorizedClientManager authorizedClientManager;

  @Test
  void contextLoads() {
    // empty due to only testing context load
  }
}
