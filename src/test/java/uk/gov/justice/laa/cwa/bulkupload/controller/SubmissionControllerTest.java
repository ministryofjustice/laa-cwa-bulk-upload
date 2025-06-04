package uk.gov.justice.laa.cwa.bulkupload.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.justice.laa.cwa.bulkupload.response.SubmissionResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(SubmissionController.class)
@AutoConfigureMockMvc(addFilters = false)
class SubmissionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CwaUploadService cwaUploadService;

    @Test
    void shouldReturnSuccessViewOnSuccessfulSubmission() throws Exception {
        SubmissionResponseDto response = new SubmissionResponseDto();
        response.setStatus("success");
        response.setMessage("Submitted");
        when(cwaUploadService.submit(eq("file123"), any())).thenReturn(response);

        mockMvc.perform(post("/submit").param("fileId", "file123"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/submission-results"))
                .andExpect(model().attributeDoesNotExist("error"));
    }

    @Test
    void shouldReturnErrorViewOnFailedSubmission() throws Exception {
        SubmissionResponseDto response = new SubmissionResponseDto();
        response.setStatus("failure");
        response.setMessage("Error occurred");
        when(cwaUploadService.submit(eq("file123"), any())).thenReturn(response);

        mockMvc.perform(post("/submit").param("fileId", "file123"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/submission-results"))
                .andExpect(model().attributeExists("error"));
    }

    @Test
    void shouldReturnErrorViewWhenSubmissionResponseIsNull() throws Exception {
        when(cwaUploadService.submit(eq("file123"), any())).thenReturn(null);

        mockMvc.perform(post("/submit").param("fileId", "file123"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/submission-results"))
                .andExpect(model().attributeExists("error"));
    }
}