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
import uk.gov.justice.laa.cwa.bulkupload.response.SubmissionResponseDto;
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
            throw new IllegalArgumentException("file cannot be null");
        }
        if (userName == null) {
            throw new IllegalArgumentException("userName cannot be null");
        }
        if (provider == null) {
            throw new IllegalArgumentException("provider cannot be null");
        }

        MultipartBodyBuilder builder = new MultipartBodyBuilder();
        builder.part("file", file.getResource());
        builder.part("username", userName);
        //  builder.part("provider", provider);

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
     *
     * @param userName for which providers are to be fetched
     * @return List of VendorDto
     */
    public List<VendorDto> getProviders(String userName) {
        return restClient.get()
                .uri(cwaApiUrl + "/validate_user", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

    }

    /**
     * Validates the file in CWA.
     *
     * @param fileId   the ID of the file to be validated.
     * @param userName the user who is validating the file.
     * @param provider the provider for which validation is to be done.
     * @return ValidateResponseDto containing validation results.
     */
    public ValidateResponseDto processSubmission(String fileId, String userName, String provider) {
        if (fileId == null) {
            throw new IllegalArgumentException("fileId cannot be null");
        }
        if (userName == null) {
            throw new IllegalArgumentException("userName cannot be null");
        }
        if (provider == null) {
            throw new IllegalArgumentException("provider cannot be null");
        }
        return restClient.post()
                .uri(cwaApiUrl + "/process_bulkload", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .queryParam("am_bulk_file_id", fileId)
                        .queryParam("vendor_id", provider)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(ValidateResponseDto.class);

    }

    /**
     * Retrieves the upload summary from CWA.
     *
     * @param fileId   the ID of the file for which summary is to be fetched.
     * @param userName the user who is fetching the summary.
     * @param provider the provider for which summary is to be fetched.
     * @return List of CwaUploadSummaryResponseDto containing the upload summary.
     */
    public List<CwaUploadSummaryResponseDto> getUploadSummary(String fileId, String userName, String provider) {
        return restClient.get()
                .uri(cwaApiUrl + "/get_bulkload_summary", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .queryParam("am_bulk_file_id", fileId)
                        .queryParam("vendor_id", provider)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

    }

    /**
     * Retrieves the upload errors from CWA.
     *
     * @param fileId   the ID of the file for which errors are to be fetched.
     * @param userName the user who is fetching the errors.
     * @param provider the provider for which errors are to be fetched.
     * @return List of CwaUploadErrorResponseDto containing the upload errors.
     */
    public List<CwaUploadErrorResponseDto> getUploadErrors(String fileId, String userName, String provider) {
        return restClient.get()
                .uri(cwaApiUrl + "/get_bulkload_errors", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .queryParam("am_bulk_file_id", fileId)
                        .queryParam("vendor_id", provider)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(new ParameterizedTypeReference<>() {
                });

    }

    /**
     * Submits the file for processing in CWA.
     *
     * @param fileId   the ID of the file to be submitted
     * @param userName the user who is submitting the file
     * @return SubmissionResponseDto containing submission results
     */
    public SubmissionResponseDto submit(String fileId, String userName) {
        return restClient.post()
                .uri(cwaApiUrl + "/submit", uriBuilder -> uriBuilder
                        .queryParam("username", userName)
                        .queryParam("am_bulk_file_id", fileId)
                        .build())
                .header("Authorization", "Bearer " + tokenService.getSdsAccessToken())
                .retrieve()
                .body(SubmissionResponseDto.class);

    }
}