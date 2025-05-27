package uk.gov.justice.laa.cwa.bulkupload.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.justice.laa.cwa.bulkupload.response.UploadResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.service.VirusCheckService;

/**
 * Controller for handling the bulk upload requests.
 */
@Controller
public class BulkUploadController {

    private final VirusCheckService virusCheckService;

    public BulkUploadController(VirusCheckService virusCheckService) {
        this.virusCheckService = virusCheckService;
    }

    /**
     * Renders the upload page.
     *
     * @return the upload page
     */
    @GetMapping("/")
    public String showUploadPage() {
        return "pages/upload";
    }

    /**
     * Performs a bulk uploaded for the given file.
     *
     * @param file the file to be uploaded
     * @return the upload results page
     */
    @PostMapping("/upload")
    public String performUpload(@RequestParam("fileUpload") MultipartFile file) {
        if (file.isEmpty()) {
            return "pages/upload-failure";
        }
        try {
            UploadResponseDto uploadResponseDto = virusCheckService.checkVirus(file);
            System.out.println("UploadResponseDto :: " + uploadResponseDto.getDetail());
        } catch (Exception e) {
            e.printStackTrace();
        }

        return "pages/upload-success";
    }
}
