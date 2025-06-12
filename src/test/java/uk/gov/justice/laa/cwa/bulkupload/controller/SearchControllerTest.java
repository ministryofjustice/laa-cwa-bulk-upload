package uk.gov.justice.laa.cwa.bulkupload.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.justice.laa.cwa.bulkupload.helper.ProviderHelper;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(SearchController.class)
@AutoConfigureMockMvc(addFilters = false)
class SearchControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private CwaUploadService cwaUploadService;

    @MockitoBean
    private ProviderHelper providerHelper;

    @Test
    void shouldReturnErrorWhenProviderMissing() throws Exception {
        doNothing().when(providerHelper).populateProviders(any());
        mockMvc.perform(post("/search").param("searchTerm", "file123"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/upload"))
                .andExpect(model().attribute("error", "Please select a provider"));
    }

    @Test
    void shouldReturnErrorWhenSearchTermMissing() throws Exception {
        doNothing().when(providerHelper).populateProviders(any());
        mockMvc.perform(post("/search").param("provider", "TestProvider"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/upload"))
                .andExpect(model().attribute("error", "Please enter file reference to search"));
    }

    @Test
    void shouldReturnSubmissionResultsOnSuccess() throws Exception {
        List<CwaUploadSummaryResponseDto> summary = Collections.emptyList();
        List<CwaUploadErrorResponseDto> errors = Collections.emptyList();
        when(cwaUploadService.getUploadSummary(eq("file123"), any(), eq("TestProvider"))).thenReturn(summary);
        when(cwaUploadService.getUploadErrors(eq("file123"), any(), eq("TestProvider"))).thenReturn(errors);

        mockMvc.perform(post("/search")
                        .param("provider", "TestProvider")
                        .param("searchTerm", "file123"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/submission-results"))
                .andExpect(model().attribute("summary", summary))
                .andExpect(model().attribute("errors", errors));
    }
}