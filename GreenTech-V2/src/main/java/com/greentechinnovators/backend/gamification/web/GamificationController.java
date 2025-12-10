package com.greentechinnovators.backend.gamification.web;

import com.greentechinnovators.backend.gamification.dto.request.SubmitChallengeRequestDTO;
import com.greentechinnovators.backend.gamification.dto.response.UserGamificationStatsResponseDTO;
import com.greentechinnovators.backend.gamification.service.ChallengeSubmissionService;
import com.greentechinnovators.backend.gamification.service.GamificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;
    private final ChallengeSubmissionService submissionService;

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
    public ResponseEntity<?> getActiveChallenges() {
        return ResponseEntity.ok().build();
    }
}