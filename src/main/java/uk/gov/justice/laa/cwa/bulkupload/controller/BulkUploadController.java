package uk.gov.justice.laa.cwa.bulkupload.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.util.StringUtils;
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
        populateProviders(model);
        return "pages/upload";
    }

    /**
     * Populates the providers in the model for the upload page.
     *
     * @param model the model to be populated with providers.
     */
    private void populateProviders(Model model) {
        List<VendorDto> providers = cwaUploadService.getProviders("TestUser");
        model.addAttribute("providers", providers);
    }

    /**
     * Performs a bulk uploaded for the given file.
     *
     * @param file the file to be uploaded
     * @return the upload results page
     */
    @PostMapping("/upload")
    public String performUpload(@RequestParam("fileUpload") MultipartFile file, String provider, Model model) {
        if (!StringUtils.hasText(provider)) {
            model.addAttribute("error", "Please select a provider");
            populateProviders(model);
            return "pages/upload";
        }
        if (file.isEmpty()) {
            model.addAttribute("error", "Please select a file to upload");
            populateProviders(model);
            return "pages/upload";
        }

        try {
            virusCheckService.checkVirus(file);
            CwaUploadResponseDto cwaUploadResponseDto = cwaUploadService.uploadFile(file, provider, "TestUser");
            ValidateResponseDto validateResponseDto = cwaUploadService.validate(cwaUploadResponseDto.getFileId(), "TestUser");
            List<CwaUploadSummaryResponseDto> summary = cwaUploadService.getUploadSummary(cwaUploadResponseDto.getFileId());
            model.addAttribute("summary", summary);
            if (validateResponseDto.getStatus().equals("failure")) {
                List<CwaUploadErrorResponseDto> errors = cwaUploadService.getUploadErrors(cwaUploadResponseDto.getFileId());
                log.error("Validation failed: {}", validateResponseDto.getMessage());
                model.addAttribute("errors", errors);
                return "pages/upload-results";
            }
            log.info("File uploaded successfully with ID: {}", cwaUploadResponseDto.getFileId());

            log.info("CwaUploadResponseDto :: {}", cwaUploadResponseDto.getFileId());
        } catch (Exception e) {
            log.error("Exception", e);
        }

        return "pages/upload-results";
    }
}
