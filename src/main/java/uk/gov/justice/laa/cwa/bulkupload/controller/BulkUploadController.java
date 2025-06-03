package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.ValidateResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.VendorDto;
import uk.gov.justice.laa.cwa.bulkupload.service.CwaUploadService;
import uk.gov.justice.laa.cwa.bulkupload.service.VirusCheckService;

import java.util.List;

/**
 * Controller for handling the bulk upload requests.
 */
@Slf4j
@RequiredArgsConstructor
@Controller
public class BulkUploadController {

    private final VirusCheckService virusCheckService;
    private final CwaUploadService cwaUploadService;

    /**
     * Renders the upload page.
     *
     * @return the upload page
     */
    @GetMapping("/")
    public String showUploadPage(Model model) {
        List<VendorDto> providers = cwaUploadService.getProviders("TestUser");
        model.addAttribute("providers", providers);
        return "pages/upload";
    }

    /**
     * Performs a bulk uploaded for the given file.
     *
     * @param file the file to be uploaded
     * @return the upload results page
     */
    @PostMapping("/upload")
    public String performUpload(@RequestParam("fileUpload") MultipartFile file, String provider) {
        if (file.isEmpty()) {
            return "pages/upload-failure";
        }
        try {
            virusCheckService.checkVirus(file);
            CwaUploadResponseDto cwaUploadResponseDto = cwaUploadService.uploadFile(file, provider, "TestUser");
            ValidateResponseDto validateResponseDto = cwaUploadService.validate(cwaUploadResponseDto.getFileId(), "TestUser");
            if (validateResponseDto.getStatus().equals("failure")) {
                List<CwaUploadErrorResponseDto> errors = cwaUploadService.getUploadErrors(cwaUploadResponseDto.getFileId());
                log.error("Validation failed: {}", validateResponseDto.getMessage());
                return "pages/upload-failure";
            }
            log.info("File uploaded successfully with ID: {}", cwaUploadResponseDto.getFileId());
            List<CwaUploadSummaryResponseDto> summary = cwaUploadService.getUploadSummary(cwaUploadResponseDto.getFileId());
            log.info("CwaUploadResponseDto :: {}", cwaUploadResponseDto.getFileId());
        } catch (Exception e) {
            log.error("Exception", e);
        }

        return "pages/upload-success";
    }
}
