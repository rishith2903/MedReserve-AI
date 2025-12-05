package com.medreserve.security;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.StandardCharsets;

@Service
@Slf4j
public class AntivirusScannerService {

    @Value("${app.security.antivirus.enabled:false}")
    private boolean enabled;

    @Value("${app.security.antivirus.host:127.0.0.1}")
    private String host;

    @Value("${app.security.antivirus.port:3310}")
    private int port;

    @Value("${app.security.antivirus.timeout-ms:5000}")
    private int timeoutMs;

    @Value("${app.security.antivirus.fail-open:true}")
    private boolean failOpen;

    @PostConstruct
    public void logConfig() {
        log.info("Antivirus scanning enabled={} host={} port={} timeoutMs={} failOpen={}", enabled, host, port, timeoutMs, failOpen);
    }

    public void assertClean(MultipartFile file) {
        if (!enabled) {
            return; // scanning disabled
        }
        String filename = file.getOriginalFilename();
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, port), timeoutMs);
            socket.setSoTimeout(timeoutMs);

            OutputStream rawOut = socket.getOutputStream();
            InputStream rawIn = socket.getInputStream();

            // Send INSTREAM command (clamd protocol)
            // Many servers accept null-terminated command names
            rawOut.write("INSTREAM\0".getBytes(StandardCharsets.US_ASCII));
            rawOut.flush();

            try (DataOutputStream out = new DataOutputStream(rawOut); InputStream inFile = file.getInputStream()) {
                byte[] buffer = new byte[8192];
                int read;
                while ((read = inFile.read(buffer)) != -1) {
                    out.writeInt(read); // chunk size, network byte order
                    out.write(buffer, 0, read);
                }
                out.writeInt(0); // zero-size chunk to mark end
                out.flush();
            }

            try (BufferedReader br = new BufferedReader(new InputStreamReader(rawIn, StandardCharsets.US_ASCII))) {
                String response = br.readLine();
                if (response == null) {
                    throw new IOException("Empty response from clamd");
                }
                log.debug("ClamAV response for {}: {}", filename, response);
                String upper = response.toUpperCase();
                if (upper.contains("FOUND")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Uploaded file contains malware");
                }
                if (upper.contains("ERROR")) {
                    throw new IOException("ClamAV error: " + response);
                }
            }
        } catch (Exception e) {
            // If scanner is unavailable, follow fail-open or fail-closed policy
            if (failOpen) {
                log.warn("Antivirus scan skipped (fail-open) for {}: {}", filename, e.getMessage());
                return;
            }
            log.error("Antivirus scan failed for {}: {}", filename, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Virus scanning service unavailable");
        }
    }
}
