package uk.gov.justice.laa.cwa.bulkupload.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.ValidateResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.VirusCheckResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;
import uk.gov.justice.laa.cwa.bulkupload.service.TokenService;
import uk.gov.justice.laa.cwa.bulkupload.service.VirusCheckService;

import java.util.List;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

@WebMvcTest(BulkUploadController.class)
@AutoConfigureMockMvc(addFilters = false)
class BulkUploadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private VirusCheckService virusCheckService;

    @MockitoBean
    private CwaUploadService cwaUploadService;

    @MockitoBean
    private TokenService tokenService;  // Added TokenService mock

    @Test
    void shouldReturnUploadPage() throws Exception {
        mockMvc.perform(get("/"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/upload"))
                .andExpect(content().string(containsString("Select a file to upload")));
    }

    @Test
    void shouldUploadFile() throws Exception {

        MockMultipartFile uploadFile = new MockMultipartFile("fileUpload", "test.pdf", "text/plain", "test".getBytes());

        when(virusCheckService.checkVirus(any()))
                .thenReturn(new VirusCheckResponseDto());

        // Mock CwaUploadService and its methods
        CwaUploadResponseDto uploadResponse = new CwaUploadResponseDto();
        uploadResponse.setFileId("file123");
        when(cwaUploadService.uploadFile(any(), any(), any())).thenReturn(uploadResponse);

        ValidateResponseDto validateResponse = new ValidateResponseDto();
        validateResponse.setStatus("success");
        when(cwaUploadService.validate(any(), any())).thenReturn(validateResponse);

        CwaUploadSummaryResponseDto summary = new CwaUploadSummaryResponseDto();
        summary.setFileId(321); // Set fields as needed for your test
        when(cwaUploadService.getUploadSummary(any())).thenReturn(List.of(summary));

        mockMvc.perform(multipart("/upload")
                        .file(uploadFile)
                        .param("provider", "TestProvider"))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/upload-results"));
    }

    @Test
    void shouldNotUploadFileAndReturnErrorPage() throws Exception {

        MockMultipartFile uploadFile = new MockMultipartFile("fileUpload", "test.pdf", "text/plain", "test".getBytes());

        when(virusCheckService.checkVirus(any()))
                .thenReturn(new VirusCheckResponseDto());

        // Mock CwaUploadService and its methods
        CwaUploadResponseDto uploadResponse = new CwaUploadResponseDto();
        uploadResponse.setFileId("file123");
        when(cwaUploadService.uploadFile(any(), any(), any())).thenReturn(uploadResponse);

        ValidateResponseDto validateResponse = new ValidateResponseDto();
        validateResponse.setStatus("failure");
        when(cwaUploadService.validate(any(), any())).thenReturn(validateResponse);

        mockMvc.perform(multipart("/upload")
                        .file(uploadFile))
                .andExpect(view().name("pages/upload"));

        verify(cwaUploadService, never()).getUploadSummary(any());
    }

    @Test
    void shouldRejectEmptyFile() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "fileUpload",
                "empty.txt",
                "text/plain",
                new byte[0]
        );

        mockMvc.perform(multipart("/upload")
                        .file(emptyFile))
                .andExpect(status().isOk())
                .andExpect(view().name("pages/upload"));
    }
}