package uk.gov.justice.laa.cwa.bulkupload.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DefaultController.class)
@AutoConfigureMockMvc(addFilters = false)
class DefaultControllerTest {

  @Autowired private MockMvc mockMvc;

  @Test
  void shouldReturnLoginView() throws Exception {
    mockMvc.perform(get("/login")).andExpect(status().isOk()).andExpect(view().name("pages/login"));
  }
  
  @Test
  void shouldReturnLoggedOutView() throws Exception {
    mockMvc.perform(get("/logged-out")).andExpect(status().isOk()).andExpect(view().name("pages/logged-out"));
  }
}
