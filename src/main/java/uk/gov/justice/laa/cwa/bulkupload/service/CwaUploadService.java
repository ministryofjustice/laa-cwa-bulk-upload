package uk.gov.justice.laa.cwa.bulkupload.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadErrorResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.CwaUploadSummaryResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.ValidateResponseDto;
import uk.gov.justice.laa.cwa.bulkupload.response.VendorDto;
import java.util.List;

/**
 * Service class for performing virus check.
 */
@Service
@RequiredArgsConstructor
public class CwaUploadService {

    @Value("${cwa-api.url}")
    private String cwaApiUrl;
    private final RestClient restClient;
    private final TokenService tokenService;

    /**
     * Perform a virus check for the given file.
     *
     * @param file the file
     * @return the result
     */
    public CwaUploadResponseDto uploadFile(MultipartFile file, String provider, String userName) {
        if (file == null) {
            throw new IllegalArgumentException("File cannot be null");
        }

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", file.getResource());
        builder.part("provider", provider);
        builder.part("username", userName);

        return restClient.post()
                .uri(cwaApiUrl + "/upload")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .body(builder.build())
                .retrieve()
                .body(CwaUploadResponseDto.class);
    }

    /**
     * Retrieves the list of providers from CWA.
     * @param userName
     * @return List of VendorDto
     */
    public List<VendorDto> getProviders(String userName) {
        return restClient.get()
                .uri(cwaApiUrl + "/get_providers", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<List<VendorDto>>() {});

    }

    /**
     * Validates the file at CWA.
     * @param fileId
     * @param userName
     * @return
     */
    public ValidateResponseDto validate(String fileId, String userName) {
        return restClient.post()
                .uri(cwaApiUrl + "/validate", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .queryParam("am_bulk_file_id", fileId)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(ValidateResponseDto.class);

    }

    /**
     * Retrieves the upload summary from CWA.
     * @param fileId
     * @return
     */
    public List<CwaUploadSummaryResponseDto> getUploadSummary(String fileId) {
        return restClient.get()
                .uri(cwaApiUrl + "/get_bulkload_summary", uriBuilder -> uriBuilder
                        .queryParam("am_bulk_file_id", fileId)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<List<CwaUploadSummaryResponseDto>>() {});

    }

    /**
     * Retrieves the upload errors from CWA.
     * @param fileId
     * @return
     */
    public List<CwaUploadErrorResponseDto> getUploadErrors(String fileId) {
        return restClient.get()
                .uri(cwaApiUrl + "/get_bulkload_errors", uriBuilder -> uriBuilder
                        .queryParam("am_bulk_file_id", fileId)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<List<CwaUploadErrorResponseDto>>() {});

    }


}