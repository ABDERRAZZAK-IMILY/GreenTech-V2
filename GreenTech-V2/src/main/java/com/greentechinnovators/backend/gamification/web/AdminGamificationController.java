package com.greentechinnovators.backend.gamification.web;

import com.greentechinnovators.backend.gamification.dto.request.ChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.request.ValidateSubmissionRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.ChallengeResponseDTO;
import com.greentechinnovators.backend.gamification.domain.Challenge;
import com.greentechinnovators.backend.gamification.mapper.GamificationMapper;
import com.greentechinnovators.backend.gamification.repository.ChallengeRepository;
import com.greentechinnovators.backend.gamification.service.ChallengeSubmissionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/gamification")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminGamificationController {

    private final ChallengeRepository challengeRepository;
    private final GamificationMapper mapper;

    private final ChallengeSubmissionService submissionService;

    @PostMapping("/challenges")
    public ResponseEntity<ChallengeResponseDTO> createChallenge(@Valid @RequestBody ChallengeRequestDTO requestDTO) {
        Challenge challenge = mapper.toEntity(requestDTO);
        Challenge savedChallenge = challengeRepository.save(challenge);
        return ResponseEntity.ok(mapper.toResponse(savedChallenge));
    }

    @GetMapping("/submissions/pending")
    public ResponseEntity<?> getPendingSubmissions() {
        return ResponseEntity.ok(submissionService.getPendingSubmissions());
    }

    @PostMapping("/submissions/{id}/validate")
    public ResponseEntity<?> validateSubmission(
            @PathVariable String id,
            @RequestBody ValidateSubmissionRequestDTO request) {

        return ResponseEntity.ok(submissionService.validateSubmission(id, request.getStatus(), request.getAdminComment()));
    }

}