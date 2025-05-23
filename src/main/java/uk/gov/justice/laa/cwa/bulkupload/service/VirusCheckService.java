package uk.gov.justice.laa.cwa.bulkupload.service;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import uk.gov.justice.laa.cwa.bulkupload.response.UploadResponseDto;

import java.io.IOException;

@Service
public class VirusCheckService {
    private final RestClient restClient;
    private final TokenService tokenService;


    public VirusCheckService(RestClient restClient, TokenService tokenService) {
        this.restClient = restClient;
        this.tokenService = tokenService;
    }

    // POST request example
    public UploadResponseDto checkVirus(MultipartFile file) throws IOException {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());

        return restClient.put()
                .uri("/virus_check_file")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .header("Authorization", "Bearer " + tokenService.getAccessToken())
                .body(body)
                .retrieve()
                .body(UploadResponseDto.class);
    }
}