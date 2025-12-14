package com.greentechinnovators.backend.gamification.web;

import com.greentechinnovators.backend.gamification.dto.request.SubmitChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.ChallengeResponseDTO;
import com.greentechinnovators.backend.gamification.dto.response.SubmissionResponseDTO;
import com.greentechinnovators.backend.gamification.dto.response.UserGamificationStatsResponseDTO;
import com.greentechinnovators.backend.gamification.service.ChallengeSubmissionService;
import com.greentechinnovators.backend.gamification.service.GamificationService;
import com.greentechinnovators.backend.gamification.repository.ChallengeRepository;
import com.greentechinnovators.backend.gamification.mapper.GamificationMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GamificationController {

    private final GamificationService gamificationService;
    private final ChallengeSubmissionService submissionService;
    private final ChallengeRepository challengeRepository;
    private final GamificationMapper mapper;

  
    @GetMapping("/my-stats")
    public ResponseEntity<UserGamificationStatsResponseDTO> getMyStats(Authentication authentication) {
        String userId = authentication.getName();
        return ResponseEntity.ok(gamificationService.getUserStats(userId));
    }

  
    @GetMapping("/leaderboard")
    public ResponseEntity<List<UserGamificationStatsResponseDTO>> getLeaderboard() {
        return ResponseEntity.ok(gamificationService.getLeaderboard());
    }


    @PostMapping("/submit-challenge")
    public ResponseEntity<?> submitChallenge(
            Authentication authentication,
            @Valid @RequestBody SubmitChallengeRequestDTO request) {

        String userId = authentication.getName();
        return ResponseEntity.ok(submissionService.submitProof(userId, request));
    }

  
    @GetMapping("/challenges")
    public ResponseEntity<List<ChallengeResponseDTO>> getActiveChallenges() {
        List<ChallengeResponseDTO> challenges = challengeRepository.findByIsActiveTrue()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(challenges);
    }


    @GetMapping("/my-submissions")
    public ResponseEntity<List<SubmissionResponseDTO>> getMySubmissions(Authentication authentication) {
        try {
            String userId = authentication.getName();
            List<SubmissionResponseDTO> submissions = submissionService.getUserSubmissionsDetailed(userId);
            return ResponseEntity.ok(submissions != null ? submissions : List.of());
        } catch (Exception e) {
            return ResponseEntity.ok(List.of());
        }
    }
}