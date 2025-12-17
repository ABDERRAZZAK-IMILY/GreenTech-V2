package com.greentechinnovators.backend.controller.gamification;

import com.greentechinnovators.backend.dto.gamification.request.ChallengeRequestDTO;
import com.greentechinnovators.backend.dto.gamification.request.ValidateSubmissionRequestDTO;
import com.greentechinnovators.backend.dto.gamification.response.ChallengeResponseDTO;
import com.greentechinnovators.backend.dto.gamification.response.SubmissionResponseDTO;
import com.greentechinnovators.backend.entity.gamification.Challenge;
import com.greentechinnovators.backend.mapper.gamification.GamificationMapper;
import com.greentechinnovators.backend.repository.gamification.ChallengeRepository;
import com.greentechinnovators.backend.service.gamification.ChallengeSubmissionService;
import com.greentechinnovators.backend.service.gamification.GamificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/gamification/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminGamificationController {

    private final ChallengeRepository challengeRepository;
    private final GamificationMapper mapper;
    private final ChallengeSubmissionService submissionService;
    private final GamificationService gamificationService;

    // ==================== CHALLENGES CRUD ====================

    @GetMapping("/challenges")
    public ResponseEntity<List<ChallengeResponseDTO>> getAllChallenges() {
        List<ChallengeResponseDTO> challenges = challengeRepository.findAll()
                .stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(challenges);
    }

    @GetMapping("/challenges/{id}")
    public ResponseEntity<ChallengeResponseDTO> getChallengeById(@PathVariable String id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        return ResponseEntity.ok(mapper.toResponse(challenge));
    }

    @PostMapping("/challenges")
    public ResponseEntity<ChallengeResponseDTO> createChallenge(@Valid @RequestBody ChallengeRequestDTO requestDTO) {
        Challenge challenge = mapper.toEntity(requestDTO);
        challenge.setActive(true);
        Challenge savedChallenge = challengeRepository.save(challenge);
        return ResponseEntity.ok(mapper.toResponse(savedChallenge));
    }

    @PutMapping("/challenges/{id}")
    public ResponseEntity<ChallengeResponseDTO> updateChallenge(
            @PathVariable String id,
            @Valid @RequestBody ChallengeRequestDTO requestDTO) {
        Challenge existingChallenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        existingChallenge.setTitle(requestDTO.getTitle());
        existingChallenge.setDescription(requestDTO.getDescription());
        existingChallenge.setPointsReward(requestDTO.getPointsReward());
        existingChallenge.setCategory(requestDTO.getCategory());
        
        Challenge updatedChallenge = challengeRepository.save(existingChallenge);
        return ResponseEntity.ok(mapper.toResponse(updatedChallenge));
    }

    @PatchMapping("/challenges/{id}/toggle")
    public ResponseEntity<ChallengeResponseDTO> toggleChallengeStatus(@PathVariable String id) {
        Challenge challenge = challengeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Challenge not found"));
        
        challenge.setActive(!challenge.isActive());
        Challenge updatedChallenge = challengeRepository.save(challenge);
        return ResponseEntity.ok(mapper.toResponse(updatedChallenge));
    }

    @DeleteMapping("/challenges/{id}")
    public ResponseEntity<Map<String, Object>> deleteChallenge(@PathVariable String id) {
        if (!challengeRepository.existsById(id)) {
            throw new RuntimeException("Challenge not found");
        }
        challengeRepository.deleteById(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Challenge deleted successfully"
        ));
    }

    // ==================== SUBMISSIONS ====================

    @GetMapping("/submissions")
    public ResponseEntity<List<SubmissionResponseDTO>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissionsDetailed());
    }

    @GetMapping("/submissions/pending")
    public ResponseEntity<List<SubmissionResponseDTO>> getPendingSubmissions() {
        return ResponseEntity.ok(submissionService.getPendingSubmissionsDetailed());
    }

    @GetMapping("/submissions/stats")
    public ResponseEntity<Map<String, Object>> getSubmissionsStats() {
        return ResponseEntity.ok(submissionService.getSubmissionsStats());
    }

    @PostMapping("/submissions/{id}/validate")
    public ResponseEntity<?> validateSubmission(
            @PathVariable String id,
            @RequestBody ValidateSubmissionRequestDTO request) {

        return ResponseEntity.ok(submissionService.validateSubmission(id, request.getStatus(), request.getAdminComment()));
    }

    // ==================== POINTS MANAGEMENT ====================

    @PostMapping("/award-points")
    public ResponseEntity<?> awardPoints(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        Integer points = (Integer) request.get("points");
        String reason = (String) request.get("reason");
        
        gamificationService.addPoints(userId, points);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Points awarded successfully"
        ));
    }

    @PostMapping("/deduct-points")
    public ResponseEntity<?> deductPoints(@RequestBody Map<String, Object> request) {
        String userId = (String) request.get("userId");
        Integer points = (Integer) request.get("points");
        String reason = (String) request.get("reason");
        
        gamificationService.deductPoints(userId, points);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Points deducted successfully"
        ));
    }

}